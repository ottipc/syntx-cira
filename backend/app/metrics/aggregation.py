"""Time aggregation PER_TICK, POOLED, TIME_MEAN_EXPLICIT (07.7)."""

from __future__ import annotations

from fractions import Fraction

from .views import NumDen


def pooled(parts: list[NumDen]) -> NumDen:
    aux: dict[str, object] = {}
    for p in parts:
        for k, v in p.aux.items():
            if isinstance(v, bool) or not isinstance(v, int):
                continue
            aux[k] = int(str(aux.get(k, 0))) + v
    return NumDen(sum((p.numerator for p in parts), Fraction(0)),
                  sum((p.denominator for p in parts), Fraction(0)), aux)


def time_mean(parts: list[NumDen]) -> NumDen:
    """Mean of defined per-tick values: numerator = Σ values, denominator = #defined ticks."""
    vals = [p.numerator / p.denominator for p in parts if p.denominator != 0]
    return NumDen(sum(vals, Fraction(0)), Fraction(len(vals)),
                  {"ticks_included": len(vals), "ticks_excluded": len(parts) - len(vals)})
