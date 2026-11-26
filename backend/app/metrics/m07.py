"""M07 — GAP Detection Coverage: TP / (TP + FN); subsets ALL and OBSERVABLE_CASES (K-46)."""

from __future__ import annotations

from fractions import Fraction

from .matching import match
from .views import CaseView, GapView, NumDen

def m07(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int,
        visible_nodes: frozenset[str] | None = None) -> NumDen:
    if visible_nodes is not None:
        cases = tuple(c for c in cases if c.nodes <= visible_nodes)
    tp, fn, _fp, _ = match(cases, gaps, tick)
    return NumDen(Fraction(tp), Fraction(tp + fn), {"tp": tp, "fn": fn,
                  "observable_cases": sum(1 for c in cases if c.active(tick))})
