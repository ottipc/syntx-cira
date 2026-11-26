"""M01 — Reconstruction Distance: Σ_{D_det} w·δ(a,r) / W(D_det)  [A×R, target 0]."""

from __future__ import annotations

from fractions import Fraction

from .spaces import INCLUDE, d_det, d_ref, delta, hypotheses_excluded, weight
from .views import NumDen, TickView, Weights

def m01(v: TickView, w: Weights, policy: str = INCLUDE) -> NumDen:
    det = d_det(v, policy)
    num = sum((w.w(a.attribute) * delta(a) for a in det), Fraction(0))
    return NumDen(num, weight(det, w), {"undetermined_count": len(d_ref(v)) - len(det),
                                         "hypotheses_excluded": hypotheses_excluded(v, policy)})
