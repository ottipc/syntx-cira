"""M06 — Observation Completeness: W(D_obs) / W(D_ref)  [A×O]; aux stale_known (K-42)."""

from __future__ import annotations

from fractions import Fraction

from .spaces import d_obs, d_ref, weight
from .views import NumDen, TickView, Weights

def m06(v: TickView, w: Weights) -> NumDen:
    obs = d_obs(v)
    return NumDen(weight(obs, w), weight(d_ref(v), w), {"stale_known": sum(1 for a in obs if a.o_stale)})
