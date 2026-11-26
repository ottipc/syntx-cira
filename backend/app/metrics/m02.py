"""M02 — Relational Coherence: #TRUE / #(TRUE ∪ FALSE) over valid STATE rules  [A, O, R separately]."""

from __future__ import annotations

from fractions import Fraction

from .views import NumDen, RuleTickView

def m02(rt: RuleTickView) -> NumDen:
    t = sum(1 for _, r in rt.results if r == "TRUE")
    f = sum(1 for _, r in rt.results if r == "FALSE")
    u = sum(1 for _, r in rt.results if r == "UNEVALUABLE")
    return NumDen(Fraction(t), Fraction(t + f), {"unevaluable_count": u, "not_in_validity": rt.not_in_validity})
