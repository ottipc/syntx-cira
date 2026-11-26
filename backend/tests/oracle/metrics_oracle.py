"""Independent naive oracle on fractions.Fraction (07.11, X-18, TX13).

Shares nothing with app.metrics except the view types. Deliberately written in a different style
(explicit loops, no helper reuse) so that a shared mistake is unlikely.
"""

from __future__ import annotations

from fractions import Fraction

from app.metrics.views import (CaseView, ClosureView, FunctionSeries, GapView, RuleTickView, StabilityView,
                               TickView, Weights)

Pair = tuple[Fraction, Fraction]


def _wt(w: Weights, a: str) -> Fraction:
    table = dict(w.explicit)
    return table[a] if a in table else w.default


def _det(v: TickView, policy: str) -> list:  # type: ignore[type-arg]
    out = []
    for a in v.attrs:
        if not a.a_applicable:
            continue
        if a.r_status != "DETERMINED":
            continue
        if policy == "exclude" and a.r_class == "HYPOTHESIS":
            continue
        out.append(a)
    return out


def m01(v: TickView, w: Weights, policy: str) -> Pair:
    n = Fraction(0)
    d = Fraction(0)
    for a in _det(v, policy):
        d += _wt(w, a.attribute)
        if a.a_value != a.r_value:
            n += _wt(w, a.attribute)
    return n, d


def m11(v: TickView, w: Weights, policy: str) -> Pair:
    n = Fraction(0)
    d = Fraction(0)
    for a in _det(v, policy):
        d += _wt(w, a.attribute)
        if a.a_value == a.r_value:
            n += _wt(w, a.attribute)
    return n, d


def m05(v: TickView, w: Weights, policy: str) -> Pair:
    n = sum((_wt(w, a.attribute) for a in _det(v, policy)), Fraction(0))
    d = Fraction(0)
    for a in v.attrs:
        if a.a_applicable:
            d += _wt(w, a.attribute)
    return n, d


def m06(v: TickView, w: Weights) -> Pair:
    n = Fraction(0)
    d = Fraction(0)
    for a in v.attrs:
        if a.a_applicable:
            d += _wt(w, a.attribute)
            if a.o_status == "KNOWN":
                n += _wt(w, a.attribute)
    return n, d


def m02(rt: RuleTickView) -> Pair:
    vals = [r for _, r in rt.results]
    return Fraction(vals.count("TRUE")), Fraction(vals.count("TRUE") + vals.count("FALSE"))


m03 = m02


def m04(series: tuple[FunctionSeries, ...]) -> Pair:
    n = d = 0
    for s in series:
        for _, r in s.values:
            if r == "TRUE":
                n += 1
                d += 1
            elif r == "FALSE":
                d += 1
    return Fraction(n), Fraction(d)


def _match(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int) -> tuple[int, int, int]:
    # greedy over all admissible pairs; admissible ⇔ same node set (equivalence relation)
    free_g = sorted([g for g in gaps if g.tick == tick], key=lambda g: g.gap_id)
    tp = fn = 0
    for c in sorted(cases, key=lambda c: c.case_id):
        if not (c.tick_from <= tick and (c.tick_to is None or tick <= c.tick_to)):
            continue
        hit = next((g for g in free_g if g.nodes == c.nodes), None)
        if hit is None:
            fn += 1
        else:
            tp += 1
            free_g.remove(hit)
    return tp, fn, len(free_g)


def m07(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int,
        visible: frozenset[str] | None = None) -> Pair:
    if visible is not None:
        cases = tuple(c for c in cases if all(n in visible for n in c.nodes))
    tp, fn, _ = _match(cases, gaps, tick)
    return Fraction(tp), Fraction(tp + fn)


def m08(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int) -> Pair:
    tp, _, fp = _match(cases, gaps, tick)
    return Fraction(tp), Fraction(tp + fp)


def m09(c: ClosureView) -> Pair:
    rec = {k: r for k, r in c.recovery}
    original = [k for k, r in c.baseline if r == "FALSE"]
    resolved = [k for k in original if rec.get(k) == "TRUE"]
    return Fraction(len(resolved)), Fraction(len(original))


def m10(s: StabilityView, w: Weights) -> tuple[Fraction, Fraction, Fraction | None]:
    a1 = {k: v for k, v in s.r1}
    a2 = {k: v for k, v in s.r2}
    ws = Fraction(0)
    agree = Fraction(0)
    for a in s.reference:
        if a in a1 and a in a2:
            ws += _wt(w, a)
            if a1[a] == a2[a]:
                agree += _wt(w, a)
    wref = sum((_wt(w, a) for a in s.reference), Fraction(0))
    return agree, ws, (ws / wref if wref else None)


def pooled(parts: list[Pair]) -> Pair:
    return sum((p[0] for p in parts), Fraction(0)), sum((p[1] for p in parts), Fraction(0))


def time_mean(parts: list[Pair]) -> Fraction | None:
    vals = [n / d for n, d in parts if d]
    return sum(vals, Fraction(0)) / len(vals) if vals else None
