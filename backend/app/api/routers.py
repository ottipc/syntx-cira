"""The 21 API entries / 24 operations (Kap. 10, K-37, K-60, K-70). Runtime states come back as HTTP 200 with
artifact or projection status; HTTP errors only for request errors (P09). Every projection carries guard_class and
query_echo (K-58)."""

from __future__ import annotations

import threading
from typing import Any

from fastapi import APIRouter, Body, Query, Request
from fastapi.responses import JSONResponse

from ..contracts.common import (AdapterKind, ArtifactRef, ContentAvailability, DataOrigin, FieldId, StateSpace, load,
                                make_ref)
from ..contracts.f02 import AuthorityRecord, RuleEvaluationSet
from ..contracts.f03 import ReplayMode, ScenarioDefinition
from ..contracts.f06 import Aggregation
from ..contracts.f07 import (Block, ComparisonResponse, ComparisonsResponse, CreatedResponse, EventsProjection,
                             ExperimentsResponse, ExperimentViewResponse, FieldsResponse, GovernanceProjection,
                             GuardClass, HealthResponse, ImportCreated, MetricsProjection, ObservationProjection,
                             RecoveryVariantCreated, ReplayCreated, ReplayReportResponse, ResultsProjection,
                             ScenarioEntry, ScenariosResponse, StateProjection, SweepsCreated, TopologyProjection,
                             TraceProjection)
from ..contracts.registry import ARTIFACT_TYPES, ExperimentBundle, schema_version
from ..core.errors import CiraError, ErrorCode
from ..experiments import catalog
from ..experiments.bundle import build_bundle
from ..experiments.control import Control
from ..experiments.orchestrator import CreateRequest
from ..metrics import DEFINITIONS
from ..syntx_adapter import labels, make_adapter
from .projections import Projector, dump, ref_of

router = APIRouter()
VERSION = "1.0.2"


def ctl(req: Request) -> Control:
    return req.app.state.control  # type: ignore[no-any-return]


def pj(req: Request) -> Projector:
    return Projector(ctl(req).orch)


def ok(model: Any, status: int = 200) -> JSONResponse:
    return JSONResponse(dump(model), status_code=status)


# 1 ---------------------------------------------------------------------------------------------------------------
@router.get("/health")
def health(req: Request) -> JSONResponse:
    ads = []
    for k, cfg in ((AdapterKind.FIXTURE, "adcfg:fx_base"), (AdapterKind.IMPORT, "adcfg:import"),
                   (AdapterKind.LOCAL, "adcfg:local"), (AdapterKind.API, "adcfg:api")):
        a = make_adapter(k, cfg, documents={})
        ads.append({"descriptor": a.descriptor.model_dump(mode="json"),
                    "available": a.available() or k is AdapterKind.IMPORT})
    return ok(load(HealthResponse, {"status": "ok", "service_version": VERSION,
                                    "schema_versions": [schema_version(t) for t in sorted(ARTIFACT_TYPES)],
                                    "adapters": ads}))


# 2 ---------------------------------------------------------------------------------------------------------------
@router.get("/scenarios")
def scenarios(req: Request, variant_kind: str | None = None) -> JSONResponse:
    out = []
    for sid, _ in catalog.scenarios():
        s = catalog.get("scenario_definition", sid)
        assert isinstance(s, ScenarioDefinition)
        if variant_kind and s.variant_kind.value != variant_kind:
            continue
        base = None
        if s.variant_of is not None:
            base = next((i for i, _ in catalog.scenarios()
                         if make_ref("scenario_definition", catalog.get("scenario_definition", i)) == s.variant_of), None)
        cfgs = catalog.configs_for(sid)
        out.append(ScenarioEntry(scenario_id=s.scenario_id, version=s.version, variant_kind=s.variant_kind,
                                 variant_of=base, fixture_lineage_id=s.fixture_lineage_id, tick_count=s.tick_count,
                                 is_fixture=s.is_fixture, label=s.label, observation_configs=tuple(cfgs),
                                 targets=tuple(sorted({t for c in cfgs for t in catalog.targets_for(c)}))))
    p = pj(req)
    return ok(ScenariosResponse(header=p.header(None, None, "scenarios", GuardClass.GLOBAL, DataOrigin.SYNTHETIC),
                                scenarios=tuple(out)))


# 3 / 9 -------------------------------------------------------------------------------------------------------------
@router.post("/experiments", status_code=202)
def create_experiment(req: Request, body: dict[str, Any] = Body(...)) -> JSONResponse:
    allowed = {"scenario_id", "scenario_version", "observation_config_id", "target_definition_id", "adapter",
               "sweep_schedule", "stability", "metric_config", "label"}
    extra = set(body) - allowed
    if extra or not {"scenario_id", "observation_config_id", "target_definition_id"} <= set(body):
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, f"invalid request fields {sorted(extra) or 'missing required'}")
    r = CreateRequest(scenario_id=body["scenario_id"], observation_config_id=body["observation_config_id"],
                      target_definition_id=body["target_definition_id"], adapter=body.get("adapter", "FIXTURE"),
                      scenario_version=body.get("scenario_version"), sweep_schedule=body.get("sweep_schedule"),
                      stability=body.get("stability"), metric_config=body.get("metric_config"),
                      label=body.get("label", ""))
    if r.adapter not in {k.value for k in AdapterKind}:
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, f"unknown adapter {r.adapter}")
    exp = ctl(req).create_and_start(r)
    return ok(load(CreatedResponse, {"experiment_id": exp, "status": "CREATED",
                                     "links": {"self": f"/experiments/{exp}", "view": f"/exp/{exp}/SYSTEM_FIELD_OVERVIEW"}}), 202)


@router.get("/experiments")
def list_experiments(req: Request) -> JSONResponse:
    p = pj(req)
    return ok(ExperimentsResponse(header=p.header(None, None, "experiments", GuardClass.GLOBAL, DataOrigin.SYNTHETIC),
                                  experiments=tuple(p.list_entry(e) for e in p.s.experiments())))


# 18 (registered before the parametrised routes) ----------------------------------------------------------------
@router.post("/experiments/import", status_code=201)
def import_experiment(req: Request, body: dict[str, Any] = Body(...)) -> JSONResponse:
    exp = ctl(req).import_bundle(body)
    return ok(ReplayCreated(experiment_id=exp), 201)


# 4 -----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}")
def get_experiment(req: Request, experiment_id: str) -> JSONResponse:
    p = pj(req)
    v = p.experiment_view(experiment_id)
    return ok(ExperimentViewResponse(header=p.header(experiment_id, None, "experiment_view", GuardClass.TIMELESS,
                                                     v.data_origin, (v.definition_ref,)), experiment=v))


# 5 -----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/observations")
def observations(req: Request, experiment_id: str, tick: int = Query(...), revision: int | None = None) -> JSONResponse:
    p = pj(req)
    blk, refs = p.observation_body(experiment_id, tick, revision)
    return ok(ObservationProjection(header=p.header(experiment_id, tick, "observation_projection", GuardClass.TIMED,
                                                    DataOrigin.SYNTHETIC, tuple(refs), {"revision": revision}),
                                    observation=blk))


# 6 -----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/results")
def results(req: Request, experiment_id: str, tick: int | None = None, direction: str | None = None,
            attempt: int = 0) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    if direction not in (None, "forward", "inverse", "merged"):
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "direction must be forward, inverse or merged")
    t = p.last_sweep_tick(experiment_id) if tick is None else tick
    p.check_tick(experiment_id, t)
    fb, fr = p.block(experiment_id, "forward_result", f"fwd:t{t}:a{attempt}")
    ib, ir = p.block(experiment_id, "inverse_result", f"inv:t{t}:a{attempt}")
    rb, rr = p.block(experiment_id, "reconstruction_result", f"t{t}:a{attempt}")
    rref = rr[0] if rr else None
    props = tuple(x for _, x in p.all_latest(experiment_id, "recovery_proposal")
                  if rref is not None and x.reconstruction_ref == rref)
    pids = {make_ref("recovery_proposal", x) for _, x in p.all_latest(experiment_id, "recovery_proposal")}
    auth = tuple(a for _, a in p.all_latest(experiment_id, "authority_record") if a.proposal_ref in pids)
    origin = rb.origin or fb.origin or ib.origin or DataOrigin.SYNTHETIC
    return ok(ResultsProjection(header=p.header(experiment_id, t, "results_projection", GuardClass.TIMED, origin,
                                                tuple(fr + ir + rr), {"attempt": attempt, "direction": direction}),
                                forward=fb, inverse=ib, reconstruction=rb, proposals=props, authority_records=auth))


# 7 -----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/metrics")
def metrics(req: Request, experiment_id: str, aggregation: Aggregation = Aggregation.POOLED, tick: int | None = None,
            to_tick: int | None = None) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    if tick is not None and aggregation is not Aggregation.PER_TICK:
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "tick only with aggregation=PER_TICK (K-25)")
    if to_tick is not None and aggregation is Aggregation.PER_TICK:
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "to_tick only with POOLED or TIME_MEAN_EXPLICIT")
    e, rep = p.report(experiment_id)
    sel = p.select_results(rep, aggregation, tick, to_tick)
    view = rep.model_copy(update={"results": sel, "gap_matches": tuple(g for g in rep.gap_matches
                                                                       if tick is None or g.tick == tick),
                                  "attribute_membership": tuple(m for m in rep.attribute_membership
                                                                if tick is None or m.tick == tick)})
    guard = GuardClass.TIMED if aggregation is Aggregation.PER_TICK else GuardClass.RANGE
    return ok(MetricsProjection(header=p.header(experiment_id, tick if guard is GuardClass.TIMED else None,
                                                "metrics_projection", guard, rep.data_origin, (ref_of(e),),
                                                {"aggregation": aggregation.value, "to_tick": to_tick}),
                                report=view, definitions=DEFINITIONS))


# 8 -----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/export")
def export(req: Request, experiment_id: str, format: str = "json") -> JSONResponse:
    if format != "json":
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "format must be json")
    b: ExperimentBundle = ctl(req).export(experiment_id)
    return ok(b)


# 10 ----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/topology")
def topology(req: Request, experiment_id: str) -> JSONResponse:
    p = pj(req)
    body, refs = p.topology(experiment_id)
    return ok(TopologyProjection(header=p.header(experiment_id, None, "topology_projection", GuardClass.TIMELESS,
                                                 DataOrigin.SYNTHETIC, tuple(refs)), topology=body))


# 11 ----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/governance")
def governance(req: Request, experiment_id: str, tick: int = Query(...), space: StateSpace = StateSpace.A) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    p.check_tick(experiment_id, tick)
    rules, _ = p.rule_views(experiment_id)
    got = p.latest(experiment_id, "rule_evaluation_set", f"{space.value}:t{tick}")
    blk: Block[RuleEvaluationSet] = Block[RuleEvaluationSet](availability=ContentAvailability.NOT_AVAILABLE_AT_TICK)
    refs: tuple[ArtifactRef, ...] = ()
    if got is not None:
        blk = Block[RuleEvaluationSet](availability=ContentAvailability.AVAILABLE, origin=p.origin_of(got[0]),
                                       content=got[1])
        refs = (ref_of(got[0]),)
    origin = blk.origin or DataOrigin.SYNTHETIC
    return ok(GovernanceProjection(header=p.header(experiment_id, tick, "governance_projection", GuardClass.TIMED, origin,
                                                   refs, {"direction": space.value}), rules=rules, evaluations=blk))


# 12 ----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/states")
def states(req: Request, experiment_id: str, tick: int = Query(...)) -> JSONResponse:
    p = pj(req)
    cur, e, prev = p.states(experiment_id, tick)
    return ok(load(StateProjection, {
        "header": dump(p.header(experiment_id, tick, "state_projection", GuardClass.TIMED, DataOrigin.SYNTHETIC,
                                (ref_of(e),))),
        "values": [v.model_dump(mode="json") for v in cur.values], "delta": p.delta_a(cur, prev)}))


# 13 ----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/events")
def events(req: Request, experiment_id: str, from_: int | None = Query(None, alias="from"),
           to: int | None = None) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    lo, hi = from_ if from_ is not None else 0, to if to is not None else max(p.ticks(experiment_id) or [0])
    evs = tuple(x for _, x in sorted(p.all_latest(experiment_id, "event_record"), key=lambda y: y[1].seq)
                if lo <= x.tick <= hi)
    st = tuple(x for x in p.s.stage_events(experiment_id) if x.tick is None or lo <= x.tick <= hi)
    return ok(EventsProjection(header=p.header(experiment_id, None, "events_projection", GuardClass.RANGE,
                                               DataOrigin.SYNTHETIC, (), {"from": from_, "to": to}),
                               events=evs, stage_events=st))


# 14 ----------------------------------------------------------------------------------------------------------------
@router.get("/experiments/{experiment_id}/results/{sweep_id}/trace")
def trace(req: Request, experiment_id: str, sweep_id: str) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    key = sweep_id.split(":", 1)[1] if sweep_id.startswith("sweep:") else sweep_id
    got = p.latest(experiment_id, "sweep_run", key)
    if got is None:
        raise CiraError(ErrorCode.NOT_FOUND, f"sweep {sweep_id} not found")
    e, run = got
    t = "forward_result" if run.direction.value == "FORWARD" else "inverse_result"
    res = p.latest(experiment_id, t, key)
    blk = Block[Any](availability=ContentAvailability.NOT_AVAILABLE_AT_TICK)
    lab: dict[str, str] = {}
    if res is not None:
        blk = Block[Any](availability=ContentAvailability.AVAILABLE, origin=p.origin_of(res[0]), content=res[1].trace)
        regs = p.all_latest(experiment_id, "operator_registry")
        reg = regs[-1][1] if regs else None
        lab = labels(reg, [s.operator_ref for s in res[1].trace.steps if s.operator_ref is not None],
                     [s.sigma_ref for s in res[1].trace.steps if s.sigma_ref is not None])
    return ok(load(TraceProjection, {
        "header": dump(p.header(experiment_id, run.up_to_tick, "trace_projection", GuardClass.TIMED, p.origin_of(e),
                                (ref_of(e),), {"attempt": run.attempt, "direction": run.direction.value.lower()})),
        "sweep": run.model_dump(mode="json"), "trace": dump(blk), "registry_labels": sorted(lab.items())}))


# 15 / 16 -----------------------------------------------------------------------------------------------------------
@router.post("/experiments/{experiment_id}/sweeps", status_code=202)
def resweep(req: Request, experiment_id: str, body: dict[str, Any] | None = Body(None)) -> JSONResponse:
    ids = ctl(req).resweep(experiment_id, (body or {}).get("ticks"))
    return ok(load(SweepsCreated, {"sweep_ids": ids}), 202)


@router.post("/experiments/{experiment_id}/results/import", status_code=201)
def import_results(req: Request, experiment_id: str, body: dict[str, Any] = Body(...)) -> JSONResponse:
    refs = ctl(req).import_results(experiment_id, body)
    return ok(ImportCreated(artifact_refs=tuple(refs)), 201)


# 17 ----------------------------------------------------------------------------------------------------------------
@router.post("/experiments/{experiment_id}/replay", status_code=202)
def replay(req: Request, experiment_id: str, body: dict[str, Any] | None = Body(None)) -> JSONResponse:
    mode = ReplayMode((body or {}).get("mode", "SYNTHETIC"))
    exp = ctl(req).replay(experiment_id, mode)
    return ok(ReplayCreated(experiment_id=exp), 202)


@router.get("/experiments/{experiment_id}/replay-report")
def replay_report(req: Request, experiment_id: str) -> JSONResponse:
    p = pj(req)
    p.exists(experiment_id)
    got = p.all_latest(experiment_id, "replay_report")
    if not got:
        raise CiraError(ErrorCode.NOT_FOUND, f"no replay report for {experiment_id}")
    e, rep = got[-1]
    return ok(ReplayReportResponse(header=p.header(experiment_id, None, "replay_report", GuardClass.TIMELESS,
                                                   DataOrigin.SYNTHETIC, (ref_of(e),)), report=rep))


# 19 ----------------------------------------------------------------------------------------------------------------
@router.post("/comparisons", status_code=201)
def post_comparison(req: Request, body: dict[str, Any] = Body(...)) -> JSONResponse:
    c = ctl(req).compare(body.get("baseline_experiment_id", ""), body.get("recovery_experiment_id", ""),
                         body.get("comparison_tick"))
    p = pj(req)
    _, rep = p.comparison(c)
    return ok(ComparisonResponse(header=p.header(None, None, "comparison_report", GuardClass.COMPARISON,
                                                 DataOrigin.SYNTHETIC, (), {"comparison_id": c}), comparison=rep), 201)


@router.get("/comparisons")
def list_comparisons(req: Request, experiment_id: str | None = None) -> JSONResponse:
    p = pj(req)
    return ok(ComparisonsResponse(header=p.header(experiment_id, None, "comparisons", GuardClass.GLOBAL,
                                                  DataOrigin.SYNTHETIC), comparisons=tuple(p.comparison_entries(experiment_id))))


@router.get("/comparisons/{comparison_id}")
def get_comparison(req: Request, comparison_id: str) -> JSONResponse:
    p = pj(req)
    e, rep = p.comparison(comparison_id)
    return ok(ComparisonResponse(header=p.header(None, None, "comparison_report", GuardClass.COMPARISON,
                                                 DataOrigin.SYNTHETIC, (ref_of(e),), {"comparison_id": comparison_id}),
                                 comparison=rep))


# 20 ----------------------------------------------------------------------------------------------------------------
@router.get("/fields")
def fields(req: Request, experiment_id: str | None = None, tick: int | None = None) -> JSONResponse:
    p = pj(req)
    mans, coup, snap = p.fields(experiment_id, tick)
    guard = GuardClass.GLOBAL if experiment_id is None else (GuardClass.TIMED if tick is not None else GuardClass.TIMELESS)
    return ok(FieldsResponse(header=p.header(experiment_id, tick, "fields", guard, DataOrigin.SYNTHETIC),
                             manifests=tuple(mans), coupling_matrix=tuple(coup), configuration_snapshot=snap))


# 21 (optional, O-19; read-only in the GUI, D-49) -------------------------------------------------------------------
@router.post("/recovery-variants", status_code=201)
def recovery_variant(req: Request, body: dict[str, Any] = Body(...)) -> JSONResponse:
    auth, scn = ctl(req).recovery_variant(body)
    return ok(RecoveryVariantCreated(authority_ref=auth, scenario_ref=scn), 201)


_ = (AuthorityRecord, FieldId, threading, build_bundle)
