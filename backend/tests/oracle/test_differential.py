"""TX13 — differential testing kernel vs. oracle (hypothesis) and metric properties (07.11)."""

from __future__ import annotations

from fractions import Fraction

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.metrics import aggregation, m01, m05, m06, m07, m08, m10, m11
from app.metrics.matching import match
from app.metrics.views import AttrState, CaseView, GapView, StabilityView, TickView, Weights
from tests.oracle import metrics_oracle as O

VALS = ["A", "B", "C"]
CLASSES = ["SOURCE_OBSERVATION", "STRUCTURAL_DERIVATION", "HYPOTHESIS"]


@st.composite
def attr(draw: st.DrawFn, name: str) -> AttrState:
    applicable = draw(st.booleans()) or draw(st.booleans())
    if not applicable:
        return AttrState(attribute=name, a_applicable=False, a_value=None, o_status="NOT_APPLICABLE",
                         r_status="NOT_APPLICABLE")
    a = draw(st.sampled_from(VALS))
    known = draw(st.booleans())
    det = draw(st.booleans())
    return AttrState(attribute=name, a_applicable=True, a_value=a, o_status="KNOWN" if known else "UNKNOWN",
                     o_value=a if known else None, o_stale=known and draw(st.booleans()),
                     r_status="DETERMINED" if det else "UNDETERMINED",
                     r_value=draw(st.sampled_from(VALS)) if det else None,
                     r_class=draw(st.sampled_from(CLASSES)) if det else "OPEN_REFERENCE")


@st.composite
def tick_view(draw: st.DrawFn) -> TickView:
    n = draw(st.integers(min_value=0, max_value=12))
    return TickView(tick=0, attrs=tuple(draw(attr(f"attr:n{i:02d}/state")) for i in range(n)))


@st.composite
def weights(draw: st.DrawFn, n: int = 12) -> Weights:
    ex = draw(st.lists(st.tuples(st.integers(0, n - 1), st.integers(1, 5), st.integers(1, 4)), max_size=6))
    table = {f"attr:n{i:02d}/state": Fraction(a, b) for i, a, b in ex}
    return Weights(default=Fraction(draw(st.integers(1, 3))), explicit=tuple(sorted(table.items())))


def frac(nd: object) -> tuple[Fraction, Fraction]:
    return nd.numerator, nd.denominator  # type: ignore[attr-defined]


@pytest.mark.tid("TX13")
@settings(max_examples=300, deadline=None)
@given(tick_view(), weights(), st.sampled_from(["include", "exclude"]))
def test_kernel_equals_oracle_attribute_metrics(v: TickView, w: Weights, pol: str) -> None:
    assert frac(m01.m01(v, w, pol)) == O.m01(v, w, pol)
    assert frac(m11.m11(v, w, pol)) == O.m11(v, w, pol)
    assert frac(m05.m05(v, w, pol)) == O.m05(v, w, pol)
    assert frac(m06.m06(v, w)) == O.m06(v, w)


@pytest.mark.tid("TX13")
@settings(max_examples=300, deadline=None)
@given(tick_view(), weights(), st.sampled_from(["include", "exclude"]))
def test_properties_range_complement_undefined(v: TickView, w: Weights, pol: str) -> None:
    for nd in (m01.m01(v, w, pol), m11.m11(v, w, pol), m05.m05(v, w, pol), m06.m06(v, w)):
        if nd.denominator == 0:
            assert nd.numerator == 0  # UNDEFINED exactly at zero denominator
        else:
            assert 0 <= nd.numerator / nd.denominator <= 1
    a, b = m01.m01(v, w, pol), m11.m11(v, w, pol)
    if a.denominator:
        assert b.numerator / b.denominator == 1 - a.numerator / a.denominator


@pytest.mark.tid("TX13")
@settings(max_examples=200, deadline=None)
@given(tick_view(), weights(), st.integers(1, 7), st.randoms(use_true_random=False))
def test_permutation_and_weight_scaling_invariance(v: TickView, w: Weights, c: int, rnd: object) -> None:
    attrs = list(v.attrs)
    rnd.shuffle(attrs)  # type: ignore[attr-defined]
    pv = TickView(tick=v.tick, attrs=tuple(attrs))
    sw = Weights(default=w.default * c, explicit=tuple((k, x * c) for k, x in w.explicit))
    for f in (m01.m01, m11.m11, m05.m05):
        x, y, z = f(v, w), f(pv, w), f(v, sw)
        assert x.numerator == y.numerator and x.denominator == y.denominator
        if x.denominator:
            assert x.numerator / x.denominator == z.numerator / z.denominator


@pytest.mark.tid("TX13")
@settings(max_examples=200, deadline=None)
@given(tick_view(), weights())
def test_monotonicity_correct_attribute_does_not_raise_m01(v: TickView, w: Weights) -> None:
    extra = AttrState(attribute="attr:x99/state", a_applicable=True, a_value="A", o_status="UNKNOWN",
                      r_status="DETERMINED", r_value="A", r_class="STRUCTURAL_DERIVATION")
    before = m01.m01(v, w)
    after = m01.m01(TickView(tick=0, attrs=v.attrs + (extra,)), w)
    if before.denominator:
        assert after.numerator / after.denominator <= before.numerator / before.denominator


@pytest.mark.tid("TX13")
@settings(max_examples=200, deadline=None)
@given(st.lists(tick_view(), min_size=1, max_size=4), weights())
def test_pooled_identity(vs: list[TickView], w: Weights) -> None:
    p01 = aggregation.pooled([m01.m01(v, w) for v in vs])
    p11 = aggregation.pooled([m11.m11(v, w) for v in vs])
    assert (p01.numerator, p01.denominator) == O.pooled([O.m01(v, w, "include") for v in vs])
    if p01.denominator:
        assert p11.numerator / p11.denominator == 1 - p01.numerator / p01.denominator
    tm = aggregation.time_mean([m01.m01(v, w) for v in vs])
    om = O.time_mean([O.m01(v, w, "include") for v in vs])
    assert (tm.numerator / tm.denominator if tm.denominator else None) == om


NODESETS = [frozenset({"node:a"}), frozenset({"node:b"}), frozenset({"node:a", "node:b"}), frozenset({"node:c"})]


@st.composite
def gap_world(draw: st.DrawFn) -> tuple[tuple[CaseView, ...], tuple[GapView, ...]]:
    cs = tuple(CaseView(case_id=f"case:{i:02d}", nodes=draw(st.sampled_from(NODESETS)),
                        tick_from=draw(st.integers(0, 2)), tick_to=draw(st.one_of(st.none(), st.integers(2, 4))))
               for i in range(draw(st.integers(0, 8))))
    gs = tuple(GapView(gap_id=f"gap:{i:02d}", tick=draw(st.integers(1, 3)), nodes=draw(st.sampled_from(NODESETS)))
               for i in range(draw(st.integers(0, 8))))
    return cs, gs


@pytest.mark.tid("TX13")
@settings(max_examples=300, deadline=None)
@given(gap_world(), st.integers(1, 3))
def test_matching_equals_oracle_and_is_maximal(world: tuple[tuple[CaseView, ...], tuple[GapView, ...]], t: int) -> None:
    cs, gs = world
    assert frac(m07.m07(cs, gs, t)) == O.m07(cs, gs, t)
    assert frac(m08.m08(cs, gs, t)) == O.m08(cs, gs, t)
    tp, fn, fp, pairs = match(cs, gs, t)
    free_cases = {p[0] for p in pairs if p[2] == "FN"}
    free_gaps = {p[1] for p in pairs if p[2] == "FP"}
    nodes_c = {c.case_id: c.nodes for c in cs}
    nodes_g = {g.gap_id: g.nodes for g in gs}
    # maximality: no admissible pair left unbound
    assert not any(nodes_c[c] == nodes_g[g] for c in free_cases for g in free_gaps)
    assert match(cs, gs, t) == match(tuple(reversed(cs)), tuple(reversed(gs)), t)  # deterministic


@pytest.mark.tid("TX13")
@settings(max_examples=200, deadline=None)
@given(st.lists(st.sampled_from([f"attr:n{i}/s" for i in range(8)]), unique=True),
       st.dictionaries(st.sampled_from([f"attr:n{i}/s" for i in range(8)]), st.sampled_from(VALS)),
       st.dictionaries(st.sampled_from([f"attr:n{i}/s" for i in range(8)]), st.sampled_from(VALS)), weights(8))
def test_m10_equals_oracle(ref: list[str], r1: dict[str, str], r2: dict[str, str], w: Weights) -> None:
    s = StabilityView(reference=tuple(ref), r1=tuple(sorted(r1.items())), r2=tuple(sorted(r2.items())))
    k = m10.m10(s, w)
    n, d, sc = O.m10(s, w)
    assert (k.numerator, k.denominator) == (n, d)
    assert k.aux["shared_coverage"] == sc
