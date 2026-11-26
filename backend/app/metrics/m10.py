"""M10 — Reconstruction Stability resweep_same_bundle/v1: (W(S) − Σ_S w·δ(r1,r2)) / W(S) (S-06)."""

from __future__ import annotations

from fractions import Fraction

from .views import NumDen, StabilityView, Weights

def m10(s: StabilityView, w: Weights) -> NumDen:
    r1, r2 = dict(s.r1), dict(s.r2)
    shared = sorted(a for a in s.reference if a in r1 and a in r2)
    ws = sum((w.w(a) for a in shared), Fraction(0))
    dev = sum((w.w(a) for a in shared if r1[a] != r2[a]), Fraction(0))
    wref = sum((w.w(a) for a in s.reference), Fraction(0))
    aux: dict[str, object] = {"shared_coverage": (ws / wref) if wref != 0 else None,
                              "shared_coverage_undefined": wref == 0}
    return NumDen(ws - dev, ws, aux)
