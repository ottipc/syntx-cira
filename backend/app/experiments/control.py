"""Control operations behind the API (endpoints #3, #8, #15–#19, #21): background execution (D-23), export/import
(T10, K-52), comparison (M09), replay, recovery variants. Acts on behalf of the producing fields (K-48)."""

from __future__ import annotations

import json
import threading
from typing import Any

from pydantic import ValidationError

from ..contracts.common import ArtifactRef, ExecutionStatus, FieldId, Provenance, StageEvent, load, make_ref
from ..contracts.f02 import AuthorityRecord, GovernanceDefinition
from ..contracts.f03 import ActualState, InputEvent, ReplayMode, ScenarioDefinition, VariantKind
from ..contracts.f05 import RecoveryProposal
from ..contracts.registry import ARTIFACT_TYPES, BundleDefinitions, ExperimentBundle
from ..core.errors import CiraError, ErrorCode
from ..metrics import compare_experiments
from ..metrics.compare import meta
from ..store import ArtifactStore, capabilities
from . import catalog
from .bundle import build_bundle, verify_bundle_hash
from .orchestrator import CreateRequest, Orchestrator
from .replay import replay as do_replay


class Control:
    def __init__(self, store: ArtifactStore, background: bool = True) -> None:
        self.orch = Orchestrator(store)
        self.store = store
        self.background = background
        self.threads: dict[str, threading.Thread] = {}

    def _start(self, exp: str, fn: Any, *args: Any) -> None:
        if self.background:
            th = threading.Thread(target=fn, args=args, daemon=True, name=f"cira-{exp}")
            self.threads[exp] = th
            th.start()
        else:
            fn(*args)

    def wait(self, exp: str, timeout: float = 60.0) -> None:
        th = self.threads.get(exp)
        if th is not None:
            th.join(timeout)

    def running(self, exp: str) -> bool:
        th = self.threads.get(exp)
        return th is not None and th.is_alive()

    def _not_running(self, exp: str) -> None:
        if not self.store.stage_events(exp):
            raise CiraError(ErrorCode.NOT_FOUND, f"experiment {exp} not found", subjects=(exp,))
        if self.running(exp) or self.orch.status(exp) is ExecutionStatus.RUNNING:
            raise CiraError(ErrorCode.CONFLICT, f"experiment {exp} is RUNNING", subjects=(exp,))

    def create_and_start(self, req: CreateRequest) -> str:
        exp = self.orch.create(req)
        self._start(exp, self.orch.run, exp)
        return exp

    def resweep(self, exp: str, ticks: list[int] | None) -> list[str]:
        self._not_running(exp)
        return self.orch.resweep(exp, ticks)

    def import_results(self, exp: str, doc: dict[str, Any]) -> list[ArtifactRef]:
        self._not_running(exp)
        return self.orch.import_results(exp, doc)

    def replay(self, exp: str, mode: ReplayMode) -> str:
        self._not_running(exp)
        return do_replay(self.orch, exp, mode)

    # ---- export / import (T10) ------------------------------------------------------------------------------
    def definitions(self, exp: str) -> BundleDefinitions:
        def ref(t: str) -> ArtifactRef | None:
            es = self.store.entries(exp, t)
            if not es:
                return None
            e = es[-1]
            return ArtifactRef(artifact_id=e["artifact_id"], artifact_type=t, content_hash=e["content_hash"])
        need = {"topology": "topology_definition", "governance": "governance_definition", "scenario": "scenario_definition",
                "observation_config": "observation_config", "target": "target_definition", "weight_set": "weight_set",
                "experiment_definition": "experiment_definition"}
        d: dict[str, Any] = {k: ref(t) for k, t in need.items()}
        d["annotations"] = ref("consistency_annotation_set")
        d["operator_registry"] = ref("operator_registry")
        return BundleDefinitions(**d)

    def export(self, exp: str) -> ExperimentBundle:
        self._not_running(exp)
        return build_bundle(self.store, exp, self.definitions(exp))

    def import_bundle(self, raw: dict[str, Any]) -> str:
        try:
            b = ExperimentBundle.model_validate_json(json.dumps(raw, ensure_ascii=False))
        except ValidationError as e:
            raise CiraError(ErrorCode.IMPORT_INVALID, f"bundle does not match the contracts: {str(e)[:300]}") from e
        if not verify_bundle_hash(b):
            raise CiraError(ErrorCode.IMPORT_INVALID, "bundle_hash does not match the content")
        if self.store.stage_events(b.experiment_id):
            raise CiraError(ErrorCode.CONFLICT, f"experiment {b.experiment_id} exists", subjects=(b.experiment_id,))
        caps = capabilities()
        man = {(m.artifact_id, m.artifact_type, m.content_hash) for m in b.manifest}
        for env in b.artifacts:
            t = env.artifact_type  # type: ignore[attr-defined]
            if (env.artifact_id, t, env.content_hash) not in man:  # type: ignore[attr-defined]
                raise CiraError(ErrorCode.IMPORT_INVALID, f"{env.artifact_id} missing from manifest")  # type: ignore[attr-defined]
            if env.provenance.source_field.value not in caps[t]["W"] or len(caps[t]["W"]) != 1:  # type: ignore[attr-defined]
                raise CiraError(ErrorCode.IMPORT_INVALID, f"{t} written by {env.provenance.source_field.value}")  # type: ignore[attr-defined]
            if env.experiment_id != b.experiment_id:  # type: ignore[attr-defined]
                raise CiraError(ErrorCode.IMPORT_INVALID, "envelope of a different experiment")
        exp = b.experiment_id
        stage_list = list(b.stage_events)
        for env in sorted(b.artifacts, key=lambda e: (e.artifact_type, e.logical_key, e.revision)):  # type: ignore[attr-defined]
            got = self.store.put(experiment_id=exp, artifact_type=env.artifact_type, payload=env.payload,  # type: ignore[attr-defined]
                                 logical_key=env.logical_key, tick=env.tick, provenance=env.provenance)  # type: ignore[attr-defined]
            if got.artifact_id != env.artifact_id or got.revision != env.revision:  # type: ignore[attr-defined]
                raise CiraError(ErrorCode.IMPORT_INVALID, f"content address or revision mismatch for {env.artifact_id}")  # type: ignore[attr-defined]
        for ev in stage_list:
            self.store.stage(exp, StageEvent.model_validate_json(ev.model_dump_json()))
        self.store.meta(exp, {"imported": True})
        return exp

    # ---- comparison (#19, M09) ---------------------------------------------------------------------------------
    def compare(self, base: str, rec: str, tau: int | None) -> str:
        for e in (base, rec):
            self._not_running(e)
        def R(exp: str, t: str) -> Any:
            return self.orch.r(exp, "F06").get(self.store.entries(exp, t)[-1]["artifact_id"], t)

        def states(exp: str) -> list[ActualState]:
            r6 = self.orch.r(exp, "F06")
            return [r6.get(e["artifact_id"], "actual_state") for e in  # type: ignore[misc]
                    sorted(self.store.entries(exp, "actual_state"), key=lambda e: e["tick"])]
        sb: ScenarioDefinition = R(base, "scenario_definition")
        sr: ScenarioDefinition = R(rec, "scenario_definition")
        gb: GovernanceDefinition = R(base, "governance_definition")
        gr: GovernanceDefinition = R(rec, "governance_definition")
        tb, tr = R(base, "topology_definition"), R(rec, "topology_definition")
        mb = meta(sb, tb.version, gb.version)
        mr = meta(sr, tr.version, gr.version, sb.scenario_id if sr.variant_of == make_ref("scenario_definition", sb) else None)
        if sb.fixture_lineage_id == sr.fixture_lineage_id and (tb != tr or gb != gr):
            mr = meta(sr, tr.version + ("" if tb == tr else "+differs"), gr.version + ("" if gb == gr else "+differs"),
                      mr.variant_of)
        ed = self.orch.edef(rec)
        rep = compare_experiments(base, rec, mb, mr, gb, gr, states(base), states(rec),
                                  tau if tau is not None else ed.metric_config.comparison_tick, ed.metric_config.closure_basis)
        if not rep.compatible:
            raise CiraError(ErrorCode.COMPARISON_INCOMPATIBLE, "; ".join(rep.incompatibility), field="F06",
                            details=tuple(("comparison", r) for r in rep.incompatibility))
        self.orch.w(rec, "F06").put("comparison_report", rep, f"{base}:{rec}:{rep.comparison_tick}", rep.comparison_tick,
                                    (make_ref("scenario_definition", sb), make_ref("scenario_definition", sr)))
        return rep.comparison_key

    # ---- #21 recovery variant (O-19, D-49) -------------------------------------------------------------------
    def recovery_variant(self, body: dict[str, Any]) -> tuple[ArtifactRef, ArtifactRef | None]:
        exp = body.get("experiment_id", "")
        self._not_running(exp)
        props: dict[str, tuple[dict[str, Any], Any]] = {}
        for e in self.store.entries(exp, "recovery_proposal"):
            p: Any = self.orch.r(exp, "F07").get(e["artifact_id"], "recovery_proposal")
            props[p.proposal_id] = (e, p)
        pid = str(body.get("proposal_id", ""))
        if pid not in props:
            raise CiraError(ErrorCode.NOT_FOUND, f"proposal {pid} not found")
        e, prop = props[pid]
        assert isinstance(prop, RecoveryProposal)
        gov: GovernanceDefinition = self.orch.r(exp, "F03").get(self.store.entries(exp, "governance_definition")[-1]["artifact_id"],
                                                               "governance_definition")  # type: ignore[assignment]
        role = body.get("role_ref", "")
        if role not in {r.role_id for r in gov.roles}:
            raise CiraError(ErrorCode.SCHEMA_VIOLATION, f"unknown role {role}")
        pref = ArtifactRef(artifact_id=e["artifact_id"], artifact_type="recovery_proposal", content_hash=e["content_hash"])
        auth = load(AuthorityRecord, {"decision_id": body.get("decision_id", f"auth:{pid.split(':', 1)[1]}"),
                                      "role_ref": role, "proposal_ref": pref.model_dump(mode="json"),
                                      "decision": body.get("decision", "APPROVED"), "rationale": body.get("rationale", "")})
        W2 = self.orch.w(exp, "F02")
        a_env = W2.put("authority_record", auth, auth.decision_id, None, (pref,))
        a_ref = ArtifactRef(artifact_id=a_env.artifact_id, artifact_type="authority_record", content_hash=a_env.content_hash)
        if auth.decision.value != "APPROVED":
            return a_ref, None
        base: ScenarioDefinition = self.orch.r(exp, "F03").get(self.store.entries(exp, "scenario_definition")[0]["artifact_id"],
                                                               "scenario_definition")  # type: ignore[assignment]
        inputs = [load(InputEvent, x) for x in body.get("inputs", [])]
        scn = ScenarioDefinition(scenario_id=body.get("scenario_id", f"scn:{pid.split(':', 1)[1]}_variant"),
                                 version="1.0.0", variant_kind=VariantKind.RECOVERY,
                                 variant_of=make_ref("scenario_definition", base), derived_from_proposal=pref,
                                 authority_ref=a_ref, fixture_lineage_id=base.fixture_lineage_id,
                                 topology_ref=base.topology_ref, governance_ref=base.governance_ref,
                                 initial_state=base.initial_state, inputs=tuple(inputs), tick_count=base.tick_count,
                                 service_function_refs=base.service_function_refs, is_fixture=False,
                                 label=body.get("label", "Recovery variant (authority decision)"))
        s_env = self.orch.w(exp, "F03").put("scenario_definition", scn, f"{scn.scenario_id}@{scn.version}", None, (a_ref, pref))
        s_ref = ArtifactRef(artifact_id=s_env.artifact_id, artifact_type="scenario_definition", content_hash=s_env.content_hash)
        W2.put("authority_record", auth.model_copy(update={"created_scenario_ref": s_ref}), auth.decision_id, None,
               (pref, s_ref))
        return a_ref, s_ref


_ = (Provenance, FieldId, ARTIFACT_TYPES)
