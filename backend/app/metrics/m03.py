"""M03 — Temporal State Consistency: TRANSITION rules over consecutive available tick pairs."""

from __future__ import annotations

from fractions import Fraction

from .views import NumDen, RuleTickView

def m03(pair: RuleTickView) -> NumDen:
    t = sum(1 for _, r in pair.results if r == "TRUE")
    f = sum(1 for _, r in pair.results if r == "FALSE")
    u = sum(1 for _, r in pair.results if r == "UNEVALUABLE")
    return NumDen(Fraction(t), Fraction(t + f), {"unevaluable_count": u})
