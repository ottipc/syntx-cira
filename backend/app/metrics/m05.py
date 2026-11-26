"""M05 — Reconstruction Coverage: W(D_det) / W(D_ref)  [A×R, weighted/v1]."""

from __future__ import annotations

from fractions import Fraction

from .spaces import INCLUDE, d_det, d_ref, weight
from .views import NumDen, TickView, Weights

def m05(v: TickView, w: Weights, policy: str = INCLUDE) -> NumDen:
    return NumDen(weight(d_det(v, policy), w), weight(d_ref(v), w))
