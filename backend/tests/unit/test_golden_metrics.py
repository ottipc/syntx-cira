"""T07 / TX13 — golden fixture runner over Kap. 12.2: kernel and independent oracle against exact expectations."""

from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path
from typing import Any

import pytest

from app.contracts.common import ArtifactRef, StateSpace
from app.contracts.f01 import TopologyDefinition
from app.contracts.f02 import EvalReason, GovernanceDefinition
from app.contracts.f06 import Aggregation, CaseSubset, EvaluatedRelation, MetricId, MetricResult, MetricStatus
from app.core.hashing import artifact_id, content_hash
from app.governance import Bottom, evaluate_rules, validate_governance
from app.metrics import aggregation, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11
from app.metrics.comparison import ScenarioMeta, incompatibility
from app.metrics.result import exact_value, make_result
from app.metrics.ticksets import consecutive_pairs
from app.metrics.views import NumDen, RuleTickView
from app.topology import validate_topology
from tests.conftest import FIXTURES, load_json
from tests.fixtures import loader as L
from tests.oracle import metrics_oracle as O

ALL = sorted(p.name for p in (FIXTURES / "f06_metric_fixtures").glob("*.json"))
REL = {"M01": EvaluatedRelation.A_R, "M05": EvaluatedRelation.A_R, "M11": EvaluatedRelation.A_R,
       "M06": EvaluatedRelation.A_O, "M02": EvaluatedRelation.O, "M03": EvaluatedRelation.A,
       "M04": EvaluatedRelation.A, "M07": EvaluatedRelation.ANNOTATION_R, "M08": EvaluatedRelation.ANNOTATION_R,
       "M09": EvaluatedRelation.BASELINE_RECOVERY, "M10": EvaluatedRelation.R1_R2}


def result(mid: str, nd: NumDen | None, agg: Aggregation = Aggregation.PER_TICK, tick: int | None = 0,
           subset: CaseSubset | None = None) -> MetricResult:
    return make_result(MetricId(mid), nd, relation=REL[mid], aggregation=agg, reference_space="space:fx",
                       tick=tick, case_subset=subset)


def check(r: MetricResult, expected: str) -> None:
    if expected.startswith("UNDEFINED"):
        assert r.status is MetricStatus.UNDEFINED and r.value is None
        assert r.undefined_reason is not None and r.undefined_reason.value == expected.split(":")[1]
    else:
        assert r.status is MetricStatus.EVALUATED
        assert exact_value(r) == Fraction(expected)
        assert r.value == float(Fraction(expected))


def check_oracle(pair: tuple[Fraction, Fraction], expected: str) -> None:
    n, d = pair
    if expected.startswith("UNDEFINED"):
        assert d == 0
    else:
        assert d != 0 and n / d == Fraction(expected)


def check_aux(r: MetricResult, aux: dict[str, Any]) -> None:
    for k, v in aux.items():
        got = getattr(r.aux, k)
        if isinstance(v, str):
            assert got is not None and Fraction(got.n, got.d) == Fraction(v), k
        else:
            assert got == v, k


def ref_of(rel: str) -> ArtifactRef:
    p = load_json(rel)
    return ArtifactRef(artifact_id=artifact_id("topology_definition", p), artifact_type="topology_definition",
                       content_hash=content_hash(p))


def run_attribute_spaces(fx: dict[str, Any]) -> None:
    if "topology" in fx:
        validate_topology(TopologyDefinition.model_validate_json(json.dumps(load_json(fx["topology"]))))
    v = L.tick_view(fx["ticks"][0])
    w = L.weights(fx.get("weights"))
    pol = fx.get("policy", "include")
    kern = {"M01": m01.m01(v, w, pol), "M05": m05.m05(v, w, pol), "M06": m06.m06(v, w), "M11": m11.m11(v, w, pol)}
    orac = {"M01": O.m01(v, w, pol), "M05": O.m05(v, w, pol), "M06": O.m06(v, w), "M11": O.m11(v, w, pol)}
    for mid, exp in fx["expected"].items():
        r = result(mid, kern[mid])
        check(r, exp)
        check_oracle(orac[mid], exp)
        check_aux(r, fx.get("expected_aux", {}).get(mid, {}))


def run_rules_state(fx: dict[str, Any]) -> None:
    topo = TopologyDefinition.model_validate_json(json.dumps(load_json(fx["governance"]["topology"])))
    g = dict(fx["governance"])
    g["topology_ref"] = ref_of(g.pop("topology")).model_dump(mode="json")
    gov = validate_governance(GovernanceDefinition.model_validate_json(json.dumps(g)), topo)
    attrs = {a["attribute"]: a for a in fx["ticks"][0]["attrs"]}

    def look(attr: str) -> str | Bottom:
        a = attrs[attr]
        if a["o_status"] == "KNOWN":
            return str(a["o_value"])
        return Bottom(EvalReason.NOT_APPLICABLE_INPUT if a["o_status"] == "NOT_APPLICABLE" else EvalReason.UNKNOWN_INPUT)

    evals, niv = evaluate_rules(gov.rules, StateSpace.O, 0, look)
    split = {k: sum(1 for e in evals if e.result.value == k) for k in ("TRUE", "FALSE", "UNEVALUABLE")}
    assert split == fx["expected_split"]
    rt = RuleTickView(tick=0, results=tuple((e.rule_ref, e.result.value) for e in evals), not_in_validity=niv)
    r = result("M02", m02.m02(rt))
    check(r, fx["expected"]["M02"])
    check_oracle(O.m02(rt), fx["expected"]["M02"])
    check_aux(r, fx["expected_aux"]["M02"])


def run_rules_transition(fx: dict[str, Any]) -> None:
    pairs = consecutive_pairs(fx["available_ticks"])
    views = {p["tick"]: L.rule_tick(p) for p in fx["pairs"]}
    assert sorted(views) == [a for a, _ in pairs]
    exp = fx["expected"]["M03"]
    if not pairs:
        check(result("M03", None, Aggregation.POOLED, None), exp)
        return
    parts = [m03.m03(views[a]) for a, _ in pairs]
    r = result("M03", aggregation.pooled(parts), Aggregation.POOLED, None)
    check(r, exp)
    check_oracle(O.pooled([O.m03(views[a]) for a, _ in pairs]), exp)
    check_aux(r, fx.get("expected_aux", {}).get("M03", {}))


def run_functions(fx: dict[str, Any]) -> None:
    ss = tuple(L.series(s) for s in fx["series"])
    for s in ss:
        key = f"M04:{s.function_ref}"
        if key in fx["expected"]:
            check(result("M04", m04.m04(s), Aggregation.POOLED, None), fx["expected"][key])
            check_oracle(O.m04((s,)), fx["expected"][key])
    r = result("M04", m04.m04_pooled(ss), Aggregation.POOLED, None)
    check(r, fx["expected"]["M04"])
    check_oracle(O.m04(ss), fx["expected"]["M04"])
    check_aux(r, fx.get("expected_aux", {}).get("M04", {}))


def run_gaps(fx: dict[str, Any]) -> None:
    cs = L.cases(fx["cases"], fx["rule_applies_to"])
    gs = L.gaps(fx["gaps"], fx["rule_applies_to"])
    t = fx["tick"]
    e = fx["expected"]
    r7 = result("M07", m07.m07(cs, gs, t), subset=CaseSubset.ALL, tick=t)
    check(r7, e["M07"])
    check_oracle(O.m07(cs, gs, t), e["M07"])
    check_aux(r7, fx.get("expected_aux", {}).get("M07", {}))
    if "M08" in e:
        r8 = result("M08", m08.m08(cs, gs, t), tick=t)
        check(r8, e["M08"])
        check_oracle(O.m08(cs, gs, t), e["M08"])
        check_aux(r8, fx.get("expected_aux", {}).get("M08", {}))
    if "M07:OBSERVABLE_CASES" in e:
        vis = frozenset(fx["visible_nodes"])
        ro = result("M07", m07.m07(cs, gs, t, vis), subset=CaseSubset.OBSERVABLE_CASES, tick=t)
        check(ro, e["M07:OBSERVABLE_CASES"])
        check_oracle(O.m07(cs, gs, t, vis), e["M07:OBSERVABLE_CASES"])


def run_closure(fx: dict[str, Any]) -> None:
    c = L.closure(fx["baseline"], fx["recovery"])
    r = result("M09", m09.m09(c), Aggregation.PER_TICK, 5)
    check(r, fx["expected"]["M09"])
    check_oracle(O.m09(c), fx["expected"]["M09"])
    check_aux(r, fx["expected_aux"]["M09"])


def run_comparability(fx: dict[str, Any]) -> None:
    reasons = incompatibility(ScenarioMeta(**fx["baseline"]), ScenarioMeta(**fx["recovery"]), fx["tau"])
    assert (not reasons) == fx["expected"]["compatible"]
    assert reasons == fx["expected"]["reasons"]


def run_stability(fx: dict[str, Any]) -> None:
    s = L.stability(fx["reference"], fx["r1"], fx["r2"])
    w = L.weights(fx["weights"])
    r = result("M10", m10.m10(s, w))
    check(r, fx["expected"]["M10"])
    n, d, sc = O.m10(s, w)
    check_oracle((n, d), fx["expected"]["M10"])
    assert sc == Fraction(fx["expected_aux"]["M10"]["shared_coverage"])
    check_aux(r, fx["expected_aux"]["M10"])


def run_zero_rules(fx: dict[str, Any]) -> None:
    st, pr = L.rule_tick(fx["state"]), L.rule_tick(fx["pair"])
    ss = tuple(L.series(s) for s in fx["series"])
    rs = {"M02": result("M02", m02.m02(st)), "M03": result("M03", m03.m03(pr)),
          "M04": result("M04", m04.m04_pooled(ss), Aggregation.POOLED, None)}
    orac = {"M02": O.m02(st), "M03": O.m03(pr), "M04": O.m04(ss)}
    for mid, exp in fx["expected"].items():
        check(rs[mid], exp)
        check_oracle(orac[mid], exp)
        check_aux(rs[mid], fx["expected_aux"][mid])


def run_zero_gaps(fx: dict[str, Any]) -> None:
    ra, t, e = fx["rule_applies_to"], fx["tick"], fx["expected"]
    c0, g1 = L.cases(fx["cases_none"], ra), L.gaps(fx["gaps_some"], ra)
    c1, g0 = L.cases(fx["cases_some"], ra), L.gaps(fx["gaps_none"], ra)
    check(result("M07", m07.m07(c0, g1, t), tick=t), e["M07"])
    check_oracle(O.m07(c0, g1, t), e["M07"])
    check(result("M08", m08.m08(c1, g0, t), tick=t), e["M08"])
    check_oracle(O.m08(c1, g0, t), e["M08"])
    c = L.closure(fx["closure"]["baseline"], fx["closure"]["recovery"])
    r9 = result("M09", m09.m09(c))
    check(r9, e["M09"])
    check_oracle(O.m09(c), e["M09"])
    check_aux(r9, fx["expected_aux"]["M09"])


def run_zero_stability(fx: dict[str, Any]) -> None:
    w = L.weights(fx["weights"])
    for case in fx["cases"]:
        s = L.stability(case["reference"], case["r1"], case["r2"])
        r = result("M10", m10.m10(s, w))
        check(r, case["expected"])
        n, d, sc = O.m10(s, w)
        check_oracle((n, d), case["expected"])
        if case["shared_coverage"] == "UNDEFINED":
            assert r.aux.shared_coverage is None and r.aux.shared_coverage_undefined is True and sc is None
        else:
            assert r.aux.shared_coverage is not None
            assert Fraction(r.aux.shared_coverage.n, r.aux.shared_coverage.d) == Fraction(case["shared_coverage"])
            assert sc == Fraction(case["shared_coverage"])


def run_aggregation(fx: dict[str, Any]) -> None:
    w = L.weights(fx["weights"])
    vs = [L.tick_view(t) for t in fx["ticks"]]
    parts = [m01.m01(v, w, fx["policy"]) for v in vs]
    for v, part, exp in zip(vs, parts, fx["expected"]["PER_TICK"]):
        check(result("M01", part, Aggregation.PER_TICK, v.tick), exp)
    check(result("M01", aggregation.pooled(parts), Aggregation.POOLED, None), fx["expected"]["POOLED"])
    tm = result("M01", aggregation.time_mean(parts), Aggregation.TIME_MEAN_EXPLICIT, None)
    check(tm, fx["expected"]["TIME_MEAN_EXPLICIT"])
    check_aux(tm, fx["expected_aux"]["TIME_MEAN_EXPLICIT"])
    op = [O.m01(v, w, fx["policy"]) for v in vs]
    check_oracle(O.pooled(op), fx["expected"]["POOLED"])
    assert O.time_mean(op) == Fraction(fx["expected"]["TIME_MEAN_EXPLICIT"])


def run_sigma(fx: dict[str, Any]) -> None:
    from pydantic import ValidationError

    from app.contracts.f05 import CanonicalOperatorRef, SigmaRef
    for sid, ok in fx["sigma_cases"]:
        try:
            SigmaRef(sigma_id=sid, registry_version="v1.8.1")
            assert ok, sid
        except ValidationError:
            assert not ok, sid
    for sym, ok in fx["symbol_cases"]:
        try:
            CanonicalOperatorRef(namespace="CANONICAL_V181", symbol=sym, registry_version="v1.8.1")
            assert ok, sym
        except ValidationError:
            assert not ok, sym


RUNNERS = {"attribute_spaces": run_attribute_spaces, "rules_state": run_rules_state,
           "rules_transition": run_rules_transition, "functions": run_functions, "gaps": run_gaps,
           "closure": run_closure, "comparability": run_comparability, "stability": run_stability,
           "zero_rules": run_zero_rules, "zero_gaps": run_zero_gaps, "zero_stability": run_zero_stability,
           "aggregation": run_aggregation, "sigma": run_sigma}


@pytest.mark.tid("T07")
@pytest.mark.tid("TX13")
@pytest.mark.req("REQ-039")
@pytest.mark.req("REQ-040")
@pytest.mark.req("REQ-041")
@pytest.mark.req("REQ-042")
@pytest.mark.req("REQ-043")
@pytest.mark.req("REQ-044")
@pytest.mark.req("REQ-045")
@pytest.mark.req("REQ-046")
@pytest.mark.req("REQ-047")
@pytest.mark.req("REQ-048")
@pytest.mark.req("REQ-051")
@pytest.mark.req("REQ-052")
@pytest.mark.req("REQ-053")
@pytest.mark.req("REQ-020")
@pytest.mark.req("REQ-077")
@pytest.mark.parametrize("name", ALL)
def test_golden_fixture(name: str) -> None:
    fx = json.loads((Path(FIXTURES) / "f06_metric_fixtures" / name).read_text(encoding="utf-8"))
    assert fx["is_fixture"] is True and fx["data_origin"] == "FIXTURE"
    RUNNERS[fx["kind"]](fx)


@pytest.mark.tid("T07")
def test_every_golden_of_12_2_present() -> None:
    ids = {json.loads((FIXTURES / "f06_metric_fixtures" / n).read_text(encoding="utf-8"))["fixture_id"] for n in ALL}
    required = {"FX-04.11", "FX-04.11-W", "FX-04.11-NA", "FX-04.11-HX", "FX-M02", "FX-M03", "FX-M03-R-FINAL",
                "FX-M04", "FX-M04-2F", "FX-M07/08", "FX-MATCH-CLASS", "FX-M07-OBS", "FX-M09", "FX-M09-INCOMP",
                "FX-M10", "FX-Z-M01/M11", "FX-Z-M05/M06", "FX-Z-M02/M03/M04", "FX-Z-M07/M08/M09", "FX-Z-M10",
                "FX-AGG", "FX-SIGMA"}
    assert required <= ids


@pytest.mark.tid("T07")
def test_pooled_identity_m01_m11() -> None:
    fx = load_json("f06_metric_fixtures/fx_agg.json")
    w = L.weights(fx["weights"])
    vs = [L.tick_view(t) for t in fx["ticks"]]
    p01 = aggregation.pooled([m01.m01(v, w) for v in vs])
    p11 = aggregation.pooled([m11.m11(v, w) for v in vs])
    assert 1 - p01.numerator / p01.denominator == p11.numerator / p11.denominator
