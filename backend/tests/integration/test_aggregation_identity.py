"""07.7 POOLED identity across the pipeline (REQ-048, REQ-046, T07): for every experiment kind the stored aggregated
results equal the F06 re-aggregation of the PER_TICK results up to the last tick — same series (incl. UNDEFINED ones),
same fractions, same labels. Every metric with a tick set has PER_TICK, POOLED and TIME_MEAN_EXPLICIT results; M10 is
the single-tick case (07.3). Found missing in Phase 05 by the demo-flow test (IC-15)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

from app.contracts.f06 import Aggregation, EvaluationReport, MetricResult
from app.experiments.orchestrator import CreateRequest, Orchestrator
from app.metrics.aggregation import reaggregate, series_key
from app.store import ArtifactStore

BASE: dict[str, Any] = {"scenario_id": "scn:fx_base", "observation_config_id": "ocfg:fx_partial", "target_definition_id": "tgt:fx"}
KINDS = {"baseline": {}, "recovery": {"scenario_id": "scn:fx_rec"}, "no_engine": {"adapter": "LOCAL"},
         "sparse": {"sweep_schedule": {"mode": "EXPLICIT", "ticks": [1, 3, 5]}},
         "final": {"sweep_schedule": {"mode": "FINAL", "ticks": []}}}


def view(r: MetricResult) -> str:
    rat = (lambda x: None if x is None else (x.n, x.d))
    return repr((r.metric_id.value, r.relation.value, r.case_subset.value if r.case_subset else None, r.status.value,
                 r.undefined_reason.value if r.undefined_reason else None, rat(r.numerator), rat(r.denominator),
                 r.aux.function_ref, r.aux.ticks_included, r.aux.ticks_excluded))


@pytest.fixture(scope="module", params=list(KINDS))
def report(request: pytest.FixtureRequest, tmp_path_factory: pytest.TempPathFactory) -> tuple[str, EvaluationReport, int]:
    o = Orchestrator(ArtifactStore(tmp_path_factory.mktemp(request.param)))
    exp = o.create(CreateRequest(**{**BASE, **KINDS[request.param]}))
    o.run(exp)
    rep = o.store.load_payload(o.store.entries(exp, "evaluation_report")[-1]["artifact_id"], "evaluation_report")
    assert isinstance(rep, EvaluationReport)
    return request.param, rep, len(o.store.entries(exp, "actual_state")) - 1


@pytest.mark.tid("T07")
@pytest.mark.req("REQ-048")
@pytest.mark.parametrize("agg", [Aggregation.POOLED, Aggregation.TIME_MEAN_EXPLICIT])
def test_stored_aggregates_equal_reaggregation_to_last_tick(report: tuple[str, EvaluationReport, int], agg: Aggregation) -> None:
    _kind, rep, last = report
    stored = sorted(view(r) for r in rep.results if r.aggregation is agg)
    again = sorted(view(r) for r in reaggregate(rep.results, agg, last))
    assert stored and stored == again


@pytest.mark.tid("T07")
@pytest.mark.req("REQ-048")
@pytest.mark.req("REQ-046")
def test_every_per_tick_series_has_both_aggregates_and_m10_is_reported(report: tuple[str, EvaluationReport, int]) -> None:
    kind, rep, _ = report
    keys = {a: {series_key(r) for r in rep.results if r.aggregation is a} for a in Aggregation}
    assert keys[Aggregation.PER_TICK] <= keys[Aggregation.POOLED] == keys[Aggregation.TIME_MEAN_EXPLICIT]
    m10 = [r for r in rep.results if r.metric_id.value == "M10"]
    assert {Aggregation.POOLED, Aggregation.TIME_MEAN_EXPLICIT} <= {r.aggregation for r in m10}
    pooled10 = next(r for r in m10 if r.aggregation is Aggregation.POOLED)
    if kind == "no_engine":
        assert pooled10.status.value == "UNDEFINED" and pooled10.undefined_reason is not None
    else:
        tick10 = next(r for r in m10 if r.aggregation is Aggregation.PER_TICK)
        assert (pooled10.numerator, pooled10.denominator, pooled10.aux.shared_coverage) == \
               (tick10.numerator, tick10.denominator, tick10.aux.shared_coverage)


def test_reaggregation_restricts_to_ticks_up_to_to_tick(tmp_path: Path) -> None:
    o = Orchestrator(ArtifactStore(tmp_path))
    exp = o.create(CreateRequest(**BASE))
    o.run(exp)
    rep = o.store.load_payload(o.store.entries(exp, "evaluation_report")[-1]["artifact_id"], "evaluation_report")
    assert isinstance(rep, EvaluationReport)
    m06 = {r.tick: r for r in rep.results if r.metric_id.value == "M06" and r.aggregation is Aggregation.PER_TICK}
    up_to_2 = next(r for r in reaggregate(rep.results, Aggregation.POOLED, 2) if r.metric_id.value == "M06")
    num = sum(m06[t].numerator.n / m06[t].numerator.d for t in (0, 1, 2))  # type: ignore[union-attr]
    den = sum(m06[t].denominator.n / m06[t].denominator.d for t in (0, 1, 2))  # type: ignore[union-attr]
    assert up_to_2.numerator is not None and up_to_2.denominator is not None
    assert (up_to_2.numerator.n / up_to_2.numerator.d, up_to_2.denominator.n / up_to_2.denominator.d) == (num, den)
    assert up_to_2.reference_space.endswith(":to2") or ":to2" in up_to_2.reference_space
