"""M04 — Functional Continuity: #(f(t)=1) / #(f(t) ∈ {0,1}) per function; pooled over (function, tick)."""

from __future__ import annotations

from fractions import Fraction

from .views import FunctionSeries, NumDen

def m04(series: FunctionSeries) -> NumDen:
    ones = sum(1 for _, r in series.values if r == "TRUE")
    zeros = sum(1 for _, r in series.values if r == "FALSE")
    excl = sum(1 for _, r in series.values if r == "UNEVALUABLE")
    return NumDen(Fraction(ones), Fraction(ones + zeros), {"function_ref": series.function_ref,
                                                           "ticks_excluded": excl})


def m04_pooled(all_series: tuple[FunctionSeries, ...]) -> NumDen:
    parts = [m04(s) for s in all_series]
    return NumDen(sum((p.numerator for p in parts), Fraction(0)), sum((p.denominator for p in parts), Fraction(0)),
                  {"ticks_excluded": sum(int(str(p.aux["ticks_excluded"])) for p in parts)})
