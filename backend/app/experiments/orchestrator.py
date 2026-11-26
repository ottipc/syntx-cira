"""Orchestrator — composition root of the pipeline (Kap. 05.6, D-23, D-24, K-35, K-48).

It acts *on behalf of* fields: every read uses the FieldReader of the field it acts for, every write the FieldWriter
of the producing field (L3 capabilities stay in force, the access log feeds TX18). Field modules stay pure (ADR-0002).
Experiment state is a projection over StageEvents; no mutable experiment artifact exists.
"""

from __future__ import annotations

import json
import threading
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel

from ..contracts.common import (ArtifactRef, ErrorCodeC, ErrorRecord, ExecutionStatus, FieldId, RecoveryAction,
                                StageEvent, StageName, load, make_ref)
from ..contracts.f01 import ImmutableTopology, TopologyDefinition
from ..contracts.f02 import GovernanceDefinition
from ..contracts.f03 import ActualState, ExperimentDefinition, ScenarioDefinition
from ..contracts.f04_public import TargetDefinition
from ..contracts.f04_record import ObservationConfig, ObservationRecord
from ..core.canonical_json import canonical_bytes
from ..core.errors import CiraError, ErrorCode
from ..core.hashing import sha256_hex
from ..emulator import run_scenario, validate_scenario
from ..governance import validate_governance
from ..observation import observable_rules, observable_topology, observe, validate_config, validate_target
from ..store import ArtifactStore, FieldReader, FieldWriter
from ..strategies import ref as sref
from ..topology import seal
from . import catalog

PRODUCER = "cira.orchestrator"
VERSION = "1.0.2"


@dataclass
class CreateRequest:
    scenario_id: str
    observation_config_id: str
    target_definition_id: str
    adapter: str = "FIXTURE"
    scenario_version: str | None = None
    sweep_schedule: dict[str, Any] | None = None
    stability: dict[str, Any] | None = None
    metric_config: dict[str, Any] | None = None
    label: str = ""
    replay_of: str | None = None
    replay_mode: str | None = None
    adapter_config: str = "adcfg:fixture"
    extra: dict[str, Any] = field(default_factory=dict)


def _err(code: ErrorCodeC, f: FieldId, msg: str, rec: RecoveryAction, tick: int | None = None,
         subjects: tuple[str, ...] = ()) -> ErrorRecord:
    return ErrorRecord(code=code, field=f, message=msg, subject_refs=subjects, tick=tick, recovery=rec)


class Orchestrator:
    def __init__(self, store: ArtifactStore) -> None:
        self.store = store
        self._locks: dict[str, threading.Lock] = {}

    # ---- helpers --------------------------------------------------------------------------------------
    def w(self, exp: str, f: str) -> FieldWriter:
        return FieldWriter(self.store, FieldId(f), exp, f"{PRODUCER}/{f}", VERSION)

    def r(self, exp: str, f: str) -> FieldReader:
        return FieldReader(self.store, FieldId(f), exp)

    def stage(self, exp: str, st: StageName, status: ExecutionStatus, tick: int | None = None,
              error: ErrorRecord | None = None) -> None:
        self.store.stage(exp, StageEvent(seq=self.store.next_stage_seq(exp), stage=st, status=status, tick=tick,
                                         error=error))

    def definition_payloads(self, exp: str, f: str = "F03") -> dict[str, BaseModel]:
        """Latest definition artifacts, each read by a field allowed to read it."""
        out: dict[str, BaseModel] = {}
        readers = {"topology_definition": "F03", "immutable_topology": "F03", "governance_definition": "F03",
                   "scenario_definition": "F03", "experiment_definition": "F03", "observation_config": "F04",
                   "target_definition": "F04", "weight_set": "F06", "consistency_annotation_set": "F06",
                   "operator_registry": "F05"}
        for t, rf in readers.items():
            es = self.store.entries(exp, t)
            if es:
                out[t] = self.r(exp, rf).get(es[-1]["artifact_id"], t)
        return out

    # ---- creation (synchronous validation, 422 on error) ---------------------------------------------
    def build_definition(self, req: CreateRequest) -> tuple[dict[str, BaseModel], ExperimentDefinition]:
        scn = catalog.get("scenario_definition", req.scenario_id)
        assert isinstance(scn, ScenarioDefinition)
        if req.scenario_version and scn.version != req.scenario_version:
            raise CiraError(ErrorCode.NOT_FOUND, f"scenario {req.scenario_id}@{req.scenario_version} not found")
        topo_def = next((m for (t, _), (rel, _) in catalog.index().items() if t == "topology_definition"
                         for m in [catalog.load_file(rel, t)] if make_ref(t, m) == scn.topology_ref), None)
        gov = next((m for (t, _), (rel, _) in catalog.index().items() if t == "governance_definition"
                    for m in [catalog.load_file(rel, t)] if make_ref(t, m) == scn.governance_ref), None)
        if not isinstance(topo_def, TopologyDefinition) or not isinstance(gov, GovernanceDefinition):
            raise CiraError(ErrorCode.NOT_FOUND, "scenario references unknown topology or governance")
        itopo = seal(topo_def)
        validate_governance(gov, topo_def)
        validate_scenario(scn, itopo, gov)
        cfg = catalog.get("observation_config", req.observation_config_id)
        assert isinstance(cfg, ObservationConfig)
        validate_config(cfg, itopo, gov)
        tgt = catalog.get("target_definition", req.target_definition_id)
        assert isinstance(tgt, TargetDefinition)
        validate_target(tgt, observable_topology(cfg, itopo), observable_rules(cfg, gov))
        ws = catalog.get("weight_set", (req.metric_config or {}).get("weight_set_ref", "ws:fx_default"))
        defs: dict[str, BaseModel] = {"topology_definition": topo_def, "immutable_topology": itopo,
                                      "governance_definition": gov, "scenario_definition": scn,
                                      "observation_config": cfg, "target_definition": tgt, "weight_set": ws}
        ann = catalog.annotations_for(scn.scenario_id)
        if ann is not None:
            defs["consistency_annotation_set"] = ann
        if req.adapter == "FIXTURE":
            defs["operator_registry"] = catalog.get("operator_registry", "oreg:placeholder")
        mc = {"weight_set_ref": ws.weight_set_id, "comparison_tick": None,  # type: ignore[attr-defined]
              "hypothesis_policy": sref("metrics.hypothesis_policy").model_dump(),
              "coverage_weighting": sref("metrics.coverage_weighting").model_dump(),
              "service_function_spaces": sref("metrics.service_function_spaces").model_dump(),
              "closure_basis": sref("metrics.closure_basis").model_dump(),
              "stability_source": sref("metrics.stability_source").model_dump(),
              "gap_matcher": sref("metrics.gap_matcher").model_dump()}
        mc.update({k: v for k, v in (req.metric_config or {}).items()})
        edef = load(ExperimentDefinition, {
            "definition_version": VERSION, "scenario_ref": make_ref("scenario_definition", scn).model_dump(),
            "observation_config_ref": make_ref("observation_config", cfg).model_dump(),
            "target_definition_ref": make_ref("target_definition", tgt).model_dump(),
            "adapter": {"kind": req.adapter, "config_ref": req.adapter_config,
                        "merge_policy": sref("merge.policy").model_dump()},
            "sweep_schedule": req.sweep_schedule or {"mode": "EVERY_TICK", "ticks": []},
            "stability": req.stability or {"enabled": True, "tick": None},
            "metric_config": mc, "observation_strategy": {"budget_unit": sref("observation.budget_unit").model_dump()},
            "replay_of": req.replay_of, "replay_mode": req.replay_mode, "label": req.label or scn.label})
        return defs, edef

    def create(self, req: CreateRequest) -> str:
        defs, edef = self.build_definition(req)
        return self.create_from(defs, edef)

    def create_from(self, defs: dict[str, BaseModel], edef: ExperimentDefinition) -> str:
        base = sha256_hex(canonical_bytes(edef.model_dump(mode="json")))[:12]
        n = sum(1 for e in self.store.experiments() if e.startswith(f"exp:{base}-"))
        exp = f"exp:{base}-{n}"
        self.stage(exp, StageName.DEFINITIONS, ExecutionStatus.RUNNING)

        def W(f: str) -> FieldWriter:
            return self.w(exp, f)

        topo_ref = W("F01").put("topology_definition", defs["topology_definition"], _key(defs["topology_definition"],
                                "topology_id"), None)
        W("F01").put("immutable_topology", defs["immutable_topology"], _key(defs["topology_definition"], "topology_id"),
                     None, (_ref(topo_ref),))
        W("F02").put("governance_definition", defs["governance_definition"],
                     _key(defs["governance_definition"], "governance_id"), None, (_ref(topo_ref),))
        W("F03").put("scenario_definition", defs["scenario_definition"], _key(defs["scenario_definition"], "scenario_id"),
                     None, (_ref(topo_ref),))
        if "consistency_annotation_set" in defs:
            W("F03").put("consistency_annotation_set", defs["consistency_annotation_set"],
                         _key(defs["scenario_definition"], "scenario_id"), None)
        cfg_env = W("F04").put("observation_config", defs["observation_config"],
                               _key(defs["observation_config"], "config_id"), None, (_ref(topo_ref),))
        W("F04").put("target_definition", defs["target_definition"], _key(defs["target_definition"], "target_id"), None,
                     (_ref(cfg_env), _ref(topo_ref)))
        W("F06").put("weight_set", defs["weight_set"], _key(defs["weight_set"], "weight_set_id"), None)
        if "operator_registry" in defs:
            W("F05").put("operator_registry", defs["operator_registry"], _key(defs["operator_registry"], "registry_id"),
                         None, (), "FIXTURE")
        W("F03").put("experiment_definition", edef, "definition", None)
        self.store.meta(exp, {"label": edef.label, "scenario_id": defs["scenario_definition"].scenario_id})  # type: ignore[attr-defined]
        self.stage(exp, StageName.DEFINITIONS, ExecutionStatus.COMPLETED)
        return exp

    # ---- execution --------------------------------------------------------------------------------------
    def run(self, exp: str, preserved_from: str | None = None) -> None:
        lock = self._locks.setdefault(exp, threading.Lock())
        with lock:
            try:
                self._emulate(exp)
                self._observe(exp)
                self._after_observation(exp, preserved_from)
            except CiraError as e:
                st = _stage_of(e)
                self.stage(exp, st, ExecutionStatus.FAILED, error=_err(ErrorCodeC(e.code.value), FieldId(e.field or "F03"),
                                                                        e.message, RecoveryAction.REPLAY_FROM_INITIAL))

    def _after_observation(self, exp: str, preserved_from: str | None = None) -> None:
        """Phase 03 extends the pipeline (sweeps, merge, stability, evaluation)."""

    def _emulate(self, exp: str) -> None:
        self.stage(exp, StageName.EMULATION, ExecutionStatus.RUNNING)
        d = self.definition_payloads(exp)
        scn, itopo, gov = d["scenario_definition"], d["immutable_topology"], d["governance_definition"]
        assert isinstance(scn, ScenarioDefinition) and isinstance(itopo, ImmutableTopology)
        assert isinstance(gov, GovernanceDefinition)
        emu = run_scenario(scn, itopo, gov)
        scn_ref = make_ref("scenario_definition", scn)
        W = self.w(exp, "F03")
        for st in emu.states:
            W.put("actual_state", st, f"t{st.tick}", st.tick, (scn_ref,))
        for ev in emu.events:
            W.put("event_record", ev, f"s{ev.seq}", ev.tick, (scn_ref,))
        self.stage(exp, StageName.EMULATION, ExecutionStatus.COMPLETED)

    def _observe(self, exp: str) -> None:
        self.stage(exp, StageName.OBSERVATION, ExecutionStatus.RUNNING)
        d = self.definition_payloads(exp)
        cfg, itopo, gov = d["observation_config"], d["immutable_topology"], d["governance_definition"]
        assert isinstance(cfg, ObservationConfig) and isinstance(itopo, ImmutableTopology)
        assert isinstance(gov, GovernanceDefinition)
        R4 = self.r(exp, "F04")
        states: list[ActualState] = []
        for e in sorted(R4.entries("actual_state"), key=lambda e: e["tick"]):
            s = R4.get(e["artifact_id"], "actual_state")
            assert isinstance(s, ActualState)
            states.append(s)
        run = observe(cfg, itopo, gov, states)
        W = self.w(exp, "F04")
        key = _key(cfg, "config_id")
        cfg_ref, topo_ref, gov_ref = make_ref("observation_config", cfg), make_ref("immutable_topology", itopo), \
            make_ref("governance_definition", gov)
        W.put("observable_topology", run.observable_topology, key, None, (cfg_ref, topo_ref))
        W.put("observable_rules", run.observable_rules, key, None, (cfg_ref, gov_ref))
        partial = False
        for to in run.ticks:
            for er in to.errors:
                self.stage(exp, StageName.OBSERVATION, ExecutionStatus.PARTIAL if to.bundle is None else
                           ExecutionStatus.RUNNING, to.tick, er)
            reg = run.register_at(to.tick)
            W.put("source_register", reg, f"t{to.tick}", to.tick, (cfg_ref,))
            if to.bundle is None:
                partial = True
                continue
            benv = W.put("observation_bundle", to.bundle, f"t{to.tick}", to.tick, (topo_ref, gov_ref, cfg_ref))
            st_refs = tuple(make_ref("actual_state", states[k]) for k in sorted(set(to.state_ticks) | {to.tick}))
            rec = ObservationRecord(bundle_ref=_ref(benv), tick=to.tick, actual_state_refs=st_refs,
                                    observation_config_ref=cfg_ref)
            W.put("observation_record", rec, f"t{to.tick}", to.tick, (_ref(benv), cfg_ref) + st_refs)
        self.stage(exp, StageName.OBSERVATION, ExecutionStatus.PARTIAL if partial else ExecutionStatus.COMPLETED)

    # ---- status projection (K-35, D-24) ---------------------------------------------------------------
    def status(self, exp: str) -> ExecutionStatus:
        evs = self.store.stage_events(exp)
        if not evs:
            raise CiraError(ErrorCode.NOT_FOUND, f"experiment {exp} not found", subjects=(exp,))
        last: dict[StageName, ExecutionStatus] = {}
        for e in evs:
            last[e.stage] = e.status
        vals = set(last.values())
        if ExecutionStatus.FAILED in vals:
            return ExecutionStatus.FAILED
        if ExecutionStatus.RUNNING in vals or ExecutionStatus.CREATED in vals:
            return ExecutionStatus.RUNNING
        if ExecutionStatus.BLOCKED in vals and not self._has_reconstruction(exp):
            return ExecutionStatus.BLOCKED
        if ExecutionStatus.BLOCKED in vals or ExecutionStatus.PARTIAL in vals:
            return ExecutionStatus.PARTIAL
        return ExecutionStatus.COMPLETED if self._complete(last) else ExecutionStatus.RUNNING

    def _has_reconstruction(self, exp: str) -> bool:
        return bool(self.store.entries(exp, "reconstruction_result"))

    def _complete(self, last: dict[StageName, ExecutionStatus]) -> bool:
        return all(s in last for s in self.required_stages())

    def required_stages(self) -> tuple[StageName, ...]:
        return (StageName.DEFINITIONS, StageName.EMULATION, StageName.OBSERVATION)


def _key(m: BaseModel, id_field: str) -> str:
    return f"{getattr(m, id_field)}@{getattr(m, 'version')}"


def _ref(env: Any) -> ArtifactRef:
    return ArtifactRef(artifact_id=env.artifact_id, artifact_type=env.artifact_type, content_hash=env.content_hash)


def _stage_of(e: CiraError) -> StageName:
    return {"F03": StageName.EMULATION, "F04": StageName.OBSERVATION, "F05": StageName.FORWARD,
            "F06": StageName.EVALUATION}.get(e.field or "", StageName.DEFINITIONS)


def experiment_payload_json(m: BaseModel) -> str:
    return json.dumps(m.model_dump(mode="json"), ensure_ascii=False)
