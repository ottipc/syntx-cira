"""Projection builders (Kap. 10, K-58–K-65). The API reads with the F07 capability only and computes nothing new
beyond selection, ordering and Δ between stored states (core.delta) and pooled re-aggregation by the F06 kernel."""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from ..contracts.common import (ArtifactRef, ContentAvailability, ContentOpenness, DataOrigin, ExecutionStatus, FieldId,
                                StageName, load)
from ..contracts.f01 import ImmutableTopology, NodeView, RelationView, TopologyProjectionBody
from ..contracts.f02 import GovernanceDefinition, RuleView
from ..contracts.f03 import ActualState, ExperimentDefinition, ExperimentView, ScenarioDefinition
from ..contracts.f04_public import ObservationBundle
from ..contracts.f04_record import ObservationConfig, ObservationProjectionBody, ProjectedValue
from ..contracts.f06 import Aggregation, EvaluationReport, MetricResult
from ..contracts.f07 import (Block, ComparisonListEntry, ConfigurationSnapshot, Coupling, ExperimentListEntry,
                             FieldManifest, GuardClass, ProjectionHeader, QueryEcho)
from ..core.delta import delta_state
from ..core.errors import CiraError, ErrorCode
from ..experiments.orchestrator import Orchestrator
from ..metrics import DEFINITIONS
from ..metrics.aggregation import reaggregate
from ..store import FieldReader
from ..topology.validate import declared_applicability

ROOT = Path(__file__).resolve().parents[3]
VERSION = "1.0.2"


def ref_of(e: dict[str, Any]) -> ArtifactRef:
    return ArtifactRef(artifact_id=e["artifact_id"], artifact_type=e["artifact_type"], content_hash=e["content_hash"])


class Projector:
    def __init__(self, orch: Orchestrator) -> None:
        self.o = orch
        self.s = orch.store

    # ---- basics ---------------------------------------------------------------------------------------------
    def reader(self, exp: str | None) -> FieldReader:
        return FieldReader(self.s, FieldId.F07, None)  # projections are not logged into experiment indices

    def exists(self, exp: str) -> None:
        if not self.s.stage_events(exp):
            raise CiraError(ErrorCode.NOT_FOUND, f"experiment {exp} not found", subjects=(exp,))

    def latest(self, exp: str, t: str, key: str, revision: int | None = None) -> tuple[dict[str, Any], Any] | None:
        es = [e for e in self.s.entries(exp, t) if e["logical_key"] == key]
        if revision is not None:
            es = [e for e in es if e["revision"] == revision]
        if not es:
            return None
        e = es[-1]
        return e, self.reader(exp).get(e["artifact_id"], t)

    def all_latest(self, exp: str, t: str) -> list[tuple[dict[str, Any], Any]]:
        keys: dict[str, dict[str, Any]] = {}
        for e in self.s.entries(exp, t):
            keys[e["logical_key"]] = e
        return [(e, self.reader(exp).get(e["artifact_id"], t)) for e in keys.values()]

    def one(self, exp: str, t: str) -> Any:
        got = self.all_latest(exp, t)
        if not got:
            raise CiraError(ErrorCode.NOT_FOUND, f"{t} not found for {exp}")
        return got[-1][1]

    def header(self, exp: str | None, tick: int | None, kind: str, guard: GuardClass, origin: DataOrigin,
               refs: tuple[ArtifactRef, ...] = (), echo: dict[str, Any] | None = None) -> ProjectionHeader:
        return ProjectionHeader(experiment_id=exp, tick=tick, schema_version=f"cira.{kind}/{VERSION}", data_origin=origin,
                                source_refs=refs, guard_class=guard,
                                query_echo=load(QueryEcho, {k: v for k, v in (echo or {}).items() if v is not None}))

    def ticks(self, exp: str) -> list[int]:
        return sorted(e["tick"] for e in self.s.entries(exp, "actual_state"))

    def check_tick(self, exp: str, tick: int) -> None:
        if tick not in self.ticks(exp):
            raise CiraError(ErrorCode.NOT_FOUND, f"tick {tick} outside the experiment", subjects=(exp,))

    def origin_of(self, e: dict[str, Any]) -> DataOrigin:
        return DataOrigin(e["provenance"]["data_origin"])

    # ---- #4 ExperimentView (K-35, K-59) -------------------------------------------------------------------
    def experiment_view(self, exp: str) -> ExperimentView:
        self.exists(exp)
        evs = self.s.stage_events(exp)
        last: dict[StageName, ExecutionStatus] = {}
        errors = []
        for ev in evs:
            last[ev.stage] = ev.status
            if ev.error is not None:
                errors.append(ev.error)
        de = self.s.entries(exp, "experiment_definition")[-1]
        ed: ExperimentDefinition = self.reader(exp).get(de["artifact_id"], "experiment_definition")  # type: ignore[assignment]
        ticks = self.ticks(exp) or [0]
        sweeps = []
        for e, run in sorted(self.all_latest(exp, "sweep_run"), key=lambda x: (x[1].up_to_tick, x[1].attempt, x[1].direction.value)):
            sweeps.append({"sweep_id": run.sweep_id, "direction": run.direction.value, "up_to_tick": run.up_to_tick,
                           "attempt": run.attempt, "execution_status": run.execution_status.value,
                           "data_origin": e["provenance"]["data_origin"]})
        recs = [(e, r) for e, r in self.all_latest(exp, "reconstruction_result") if r.attempt == 0]
        openness = max(recs, key=lambda x: x[1].up_to_tick)[1].openness if recs else ContentOpenness()
        origins = {s["data_origin"] for s in sweeps if s["execution_status"] != "BLOCKED"}
        origin = "IMPORTED" if "IMPORTED" in origins else "ENGINE" if "ENGINE" in origins else \
            "FIXTURE" if "FIXTURE" in origins else "SYNTHETIC"
        comps = sorted({c.comparison_key for _, c in self.all_comparisons() if exp in
                        (c.baseline_experiment_id, c.recovery_experiment_id)})
        return load(ExperimentView, {
            "experiment_id": exp, "definition_ref": ref_of(de).model_dump(mode="json"),
            "status": self.o.status(exp).value,
            "stage_status": [{"stage": s.value, "status": v.value} for s, v in last.items()],
            "openness": openness.model_dump(mode="json"), "errors": [e.model_dump(mode="json") for e in errors],
            "label": ed.label, "data_origin": origin, "ticks": {"first": ticks[0], "last": ticks[-1]},
            "sweeps": sweeps, "comparisons": comps})

    def list_entry(self, exp: str) -> ExperimentListEntry:
        v = self.experiment_view(exp)
        scn = self.one(exp, "scenario_definition")
        return ExperimentListEntry(experiment_id=exp, label=v.label, scenario_id=scn.scenario_id, status=v.status.value,
                                   data_origin=v.data_origin)

    # ---- #12 states, #5 observations -----------------------------------------------------------------------
    def states(self, exp: str, tick: int) -> tuple[ActualState, dict[str, Any], ActualState | None]:
        self.exists(exp)
        self.check_tick(exp, tick)
        got = self.latest(exp, "actual_state", f"t{tick}")
        assert got is not None
        prev = self.latest(exp, "actual_state", f"t{tick - 1}") if tick > 0 else None
        return got[1], got[0], prev[1] if prev else None

    def delta_a(self, cur: ActualState, prev: ActualState | None) -> dict[str, Any] | None:
        if prev is None:
            return None
        b = {v.attribute_ref: (v.applicability.value, v.value) for v in prev.values}
        a = {v.attribute_ref: (v.applicability.value, v.value) for v in cur.values}
        return {"space": "A", "from_tick": prev.tick, "to_tick": cur.tick, "changes": [
            {"attribute_ref": k, "before": {"applicability": x[0], "value": x[1]},
             "after": {"applicability": y[0], "value": y[1]}} for k, x, y in delta_state(b, a)]}

    def observation_body(self, exp: str, tick: int, revision: int | None) -> tuple[Block[ObservationProjectionBody], list[ArtifactRef]]:
        self.exists(exp)
        self.check_tick(exp, tick)
        cands = sorted((e for e in self.s.entries(exp, "observation_bundle") if int(e["logical_key"][1:]) >= tick),
                       key=lambda e: (int(e["logical_key"][1:]), e["revision"]))
        if revision is not None:
            cands = [e for e in cands if e["logical_key"] == f"t{tick}" and e["revision"] == revision]
        own = [e for e in cands if e["logical_key"] == f"t{tick}"]
        e = own[-1] if own else (cands[0] if cands else None)
        if e is None:
            return Block[ObservationProjectionBody](availability=ContentAvailability.NOT_AVAILABLE_AT_TICK), []
        b: ObservationBundle = self.reader(exp).get(e["artifact_id"], "observation_bundle")  # type: ignore[assignment]
        cfg: ObservationConfig = self.one(exp, "observation_config")
        topo: ImmutableTopology = self.one(exp, "immutable_topology")
        decl = declared_applicability(topo.definition)

        def proj(t: int) -> dict[str, ProjectedValue] | None:
            ctx = next((c for c in b.contexts if c.tick == t), None)
            if ctx is None:
                return None
            best: dict[str, Any] = {}
            for o in ctx.observations:
                if o.status.value == "KNOWN":
                    k = (-o.observed_at_tick, o.source_id or "")
                    if o.attribute_ref not in best or k < best[o.attribute_ref][0]:
                        best[o.attribute_ref] = (k, o)
            out = {}
            for a in topo.attribute_universe:
                if decl[a].value == "NOT_APPLICABLE":
                    out[a] = ProjectedValue(attribute_ref=a, status="NOT_APPLICABLE")  # type: ignore[arg-type]
                elif a in best:
                    o = best[a][1]
                    out[a] = load(ProjectedValue, {"attribute_ref": a, "status": "KNOWN", "value": o.value,
                                                   "stale": o.observed_at_tick < t, "observed_at_tick": o.observed_at_tick,
                                                   "source_id": o.source_id})
                else:
                    out[a] = load(ProjectedValue, {"attribute_ref": a, "status": "UNKNOWN"})
            return out
        cur, prv = proj(tick), proj(tick - 1) if tick > 0 else None
        assert cur is not None
        delta = None
        if prv is not None:
            bb = {k: (v.status.value, v.value) for k, v in prv.items()}
            aa = {k: (v.status.value, v.value) for k, v in cur.items()}
            delta = {"space": "O", "from_tick": tick - 1, "to_tick": tick, "changes": [
                {"attribute_ref": k, "before": {"status": x[0], "value": x[1]}, "after": {"status": y[0], "value": y[1]}}
                for k, x, y in delta_state(bb, aa)]}
        ctx = next(c for c in b.contexts if c.tick == tick)
        body = load(ObservationProjectionBody, {
            "context": ctx.model_dump(mode="json"), "projected": [v.model_dump(mode="json") for v in cur.values()],
            "source_register": b.source_register.model_dump(mode="json"),
            "bundle_budget": cfg.bundle_budget.model_dump(mode="json"), "budget_usage": b.budget_usage.model_dump(mode="json"),
            "serialization_profile": b.serialization_profile, "revision": e["revision"],
            "visible_nodes": list(cfg.visible_nodes), "delta": delta})
        return Block[ObservationProjectionBody](availability=ContentAvailability.AVAILABLE,
                                                origin=DataOrigin.SYNTHETIC, content=body), [ref_of(e)]

    # ---- #6 results ------------------------------------------------------------------------------------------
    def last_sweep_tick(self, exp: str) -> int:
        ts = [int(e["logical_key"].split(":")[0][1:]) for e in self.s.entries(exp, "reconstruction_result")]
        if ts:
            return max(ts)
        ss = [e["tick"] for e in self.s.entries(exp, "sweep_run")]
        return max(ss) if ss else self.ticks(exp)[-1]

    def block(self, exp: str, t: str, key: str) -> tuple[Block[Any], list[ArtifactRef]]:
        got = self.latest(exp, t, key)
        if got is None:
            return Block[Any](availability=ContentAvailability.NOT_AVAILABLE_AT_TICK), []
        return Block[Any](availability=ContentAvailability.AVAILABLE, origin=self.origin_of(got[0]),
                          content=got[1]), [ref_of(got[0])]

    # ---- #7 metrics ------------------------------------------------------------------------------------------
    def report(self, exp: str) -> tuple[dict[str, Any], EvaluationReport]:
        got = self.all_latest(exp, "evaluation_report")
        if not got:
            raise CiraError(ErrorCode.NOT_FOUND, f"no evaluation report for {exp}")
        return got[-1]

    def select_results(self, rep: EvaluationReport, agg: Aggregation, tick: int | None, to_tick: int | None
                       ) -> tuple[MetricResult, ...]:
        if agg is Aggregation.PER_TICK:
            return tuple(r for r in rep.results if r.aggregation is agg and (tick is None or r.tick == tick))
        if to_tick is None:
            return tuple(r for r in rep.results if r.aggregation is agg)
        # re-aggregation by the F06 kernel (07.7): same series, per-tick parts up to to_tick
        return reaggregate(rep.results, agg, to_tick)

    # ---- #19 comparisons ---------------------------------------------------------------------------------
    def all_comparisons(self) -> list[tuple[dict[str, Any], Any]]:
        out = []
        for exp in self.s.experiments():
            out += self.all_latest(exp, "comparison_report")
        return out

    def comparison(self, cid: str) -> tuple[dict[str, Any], Any]:
        for e, c in self.all_comparisons():
            if c.comparison_key == cid:
                return e, c
        raise CiraError(ErrorCode.NOT_FOUND, f"comparison {cid} not found")

    def comparison_entries(self, exp: str | None) -> list[ComparisonListEntry]:
        out = []
        for _, c in self.all_comparisons():
            if exp is None or exp in (c.baseline_experiment_id, c.recovery_experiment_id):
                out.append(ComparisonListEntry(comparison_id=c.comparison_key, baseline=c.baseline_experiment_id,
                                               recovery=c.recovery_experiment_id, comparison_tick=c.comparison_tick,
                                               compatible=c.compatible))
        return sorted(out, key=lambda x: x.comparison_id)

    # ---- #10 topology, #11 governance -----------------------------------------------------------------------
    def topology(self, exp: str) -> tuple[TopologyProjectionBody, list[ArtifactRef]]:
        self.exists(exp)
        e, t = self.all_latest(exp, "immutable_topology")[-1]
        d = t.definition
        return TopologyProjectionBody(
            topology_ref=ref_of(e),
            nodes=tuple(NodeView(node_id=n.node_id, node_type=n.node_type, label=n.label,
                                 attributes=tuple(a.attribute_id for a in n.attributes)) for n in d.nodes),
            relations=tuple(RelationView(relation_id=r.relation_id, relation_type=r.relation_type, source=r.source,
                                         target=r.target) for r in d.relations)), [ref_of(e)]

    def rule_views(self, exp: str) -> tuple[tuple[RuleView, ...], GovernanceDefinition]:
        g: GovernanceDefinition = self.one(exp, "governance_definition")
        return tuple(RuleView(rule_id=r.rule_id, version=r.version, kind=r.kind, description=r.description,
                              applies_to=r.applies_to) for r in g.rules), g

    # ---- #20 fields ------------------------------------------------------------------------------------------
    def fields(self, exp: str | None, tick: int | None) -> tuple[list[FieldManifest], list[Coupling], ConfigurationSnapshot | None]:
        matrix = json.loads((ROOT / "contracts" / "coupling_matrix.json").read_text(encoding="utf-8"))
        last: dict[StageName, ExecutionStatus] = {}
        if exp is not None:
            self.exists(exp)
            for ev in self.s.stage_events(exp):
                if tick is None or ev.tick is None or ev.tick <= tick:
                    last[ev.stage] = ev.status
        mans = []
        for f in matrix["fields"]:
            m = json.loads((ROOT / "contracts" / "fields" / f"{f}.field.json").read_text(encoding="utf-8"))
            mans.append(load(FieldManifest, {
                **{k: m[k] for k in ("field_id", "name", "purpose", "package", "state_space", "writes", "reads", "ports",
                                     "stages", "couplings_out", "couplings_in", "requirements")},
                "stage_status": [[s, last[StageName(s)].value] for s in m["stages"] if StageName(s) in last]}))
        coup = [Coupling(source=FieldId(a), target=FieldId(b), carrier=c) for a, b, c in matrix["couplings"]]
        snap = None
        if exp is not None:
            ed: ExperimentDefinition = self.one(exp, "experiment_definition")
            scn: ScenarioDefinition = self.one(exp, "scenario_definition")
            cfg: ObservationConfig = self.one(exp, "observation_config")
            tgt = self.one(exp, "target_definition")
            mc = ed.metric_config
            snap = ConfigurationSnapshot(experiment_id=exp, tick=tick, scenario_id=scn.scenario_id,
                                         observation_config_id=cfg.config_id, target_id=tgt.target_id,
                                         adapter_kind=ed.adapter.kind, sweep_schedule=ed.sweep_schedule.mode.value,
                                         strategies=(ed.adapter.merge_policy, mc.hypothesis_policy, mc.coverage_weighting,
                                                     mc.service_function_spaces, mc.closure_basis, mc.stability_source,
                                                     mc.gap_matcher, ed.observation_strategy.budget_unit))
        return mans, coup, snap


def dump(m: BaseModel) -> Any:
    return m.model_dump(mode="json", by_alias=True)


Handler = Callable[..., Any]
_ = DEFINITIONS
