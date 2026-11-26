"""M08 — GAP Detection Precision: TP / (TP + FP)."""

from __future__ import annotations

from fractions import Fraction

from .matching import match
from .views import CaseView, GapView, NumDen

def m08(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int) -> NumDen:
    tp, _fn, fp, _ = match(cases, gaps, tick)
    return NumDen(Fraction(tp), Fraction(tp + fp), {"tp": tp, "fp": fp})
