"""M11 — Reconstruction Accuracy: (W(D_det) − Σ_{D_det} w·δ) / W(D_det); 1 − M01 (K-15)."""

from __future__ import annotations

from fractions import Fraction

from .spaces import INCLUDE, d_det, delta, weight
from .views import NumDen, TickView, Weights

def m11(v: TickView, w: Weights, policy: str = INCLUDE) -> NumDen:
    det = d_det(v, policy)
    wd = weight(det, w)
    return NumDen(wd - sum((w.w(a.attribute) * delta(a) for a in det), Fraction(0)), wd)
