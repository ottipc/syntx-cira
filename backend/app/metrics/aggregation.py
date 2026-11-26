"""Time aggregation PER_TICK, POOLED, TIME_MEAN_EXPLICIT (07.7)."""

from __future__ import annotations

import re
from collections.abc import Sequence
from fractions import Fraction

from ..contracts.f06 import Aggregation, MetricResult
from .result import make_result
from .views import NumDen


def _is_count(v: object) -> bool:
    return isinstance(v, int) and not isinstance(v, bool)


def _shared_labels(parts: Sequence[NumDen]) -> dict[str, object]:
    """Non-count aux values (function_ref, shared_coverage, …) survive aggregation only when every part carries the
    same value; counts are summed (pooled) or replaced by tick counts (time mean)."""
    keys = {k for p in parts for k, v in p.aux.items() if v is not None and not _is_count(v)}
    return {k: parts[0].aux[k] for k in sorted(keys) if all(p.aux.get(k) == parts[0].aux.get(k) for p in parts)}


def pooled(parts: list[NumDen]) -> NumDen:
    aux: dict[str, object] = dict(_shared_labels(parts)) if parts else {}
    for p in parts:
        for k, v in p.aux.items():
            if _is_count(v):
                aux[k] = int(str(aux.get(k, 0))) + int(str(v))
    return NumDen(sum((p.numerator for p in parts), Fraction(0)),
                  sum((p.denominator for p in parts), Fraction(0)), aux)


def time_mean(parts: list[NumDen]) -> NumDen:
    """Mean of defined per-tick values: numerator = Σ values, denominator = #defined ticks."""
    vals = [p.numerator / p.denominator for p in parts if p.denominator != 0]
    aux: dict[str, object] = dict(_shared_labels(parts)) if parts else {}
    aux.update(ticks_included=len(vals), ticks_excluded=len(parts) - len(vals))
    return NumDen(sum(vals, Fraction(0)), Fraction(len(vals)), aux)


_SPACE = re.compile(r"^(space:[a-z_]+):(?:pooled|to\d+|t\d+)(.*)$")


def series_key(r: MetricResult) -> tuple[str, str, str, str]:
    """Identity of one metric series across PER_TICK and aggregated results (same space modulo its tick token)."""
    m = _SPACE.match(r.reference_space)
    space = (m.group(1) + m.group(2)) if m else r.reference_space
    return (r.metric_id.value, r.relation.value, r.case_subset.value if r.case_subset else "", space)


def _part(r: MetricResult) -> NumDen | None:
    if r.numerator is None or r.denominator is None:
        return None
    aux: dict[str, object] = {}
    for k, v in r.aux.model_dump().items():
        if v is not None:
            aux[k] = Fraction(v["n"], v["d"]) if isinstance(v, dict) else v
    return NumDen(Fraction(r.numerator.n, r.numerator.d), Fraction(r.denominator.n, r.denominator.d), aux)


def reaggregate(results: Sequence[MetricResult], agg: Aggregation, to_tick: int | None) -> tuple[MetricResult, ...]:
    """07.7 over the PER_TICK results with tick ≤ to_tick. The stored aggregated results of `agg` define which series
    exist (so an UNDEFINED series stays visible); their values are recomputed from the per-tick parts. With
    to_tick ≥ the last tick this reproduces the stored aggregates exactly (POOLED identity, tested)."""
    per: dict[tuple[str, str, str, str], list[MetricResult]] = {}
    for r in results:
        if r.aggregation is Aggregation.PER_TICK and r.tick is not None and (to_tick is None or r.tick <= to_tick):
            per.setdefault(series_key(r), []).append(r)
    out: list[MetricResult] = []
    for s in (r for r in results if r.aggregation is agg):
        rs = per.get(series_key(s), [])
        parts = [p for p in (_part(r) for r in sorted(rs, key=lambda x: x.tick or 0)) if p is not None]
        nd = (pooled(parts) if agg is Aggregation.POOLED else time_mean(parts)) if parts else None
        space = s.reference_space if to_tick is None else re.sub(r":pooled", f":to{to_tick}", s.reference_space, count=1)
        out.append(make_result(s.metric_id, nd, relation=s.relation, aggregation=agg, reference_space=space, tick=None,
                               case_subset=s.case_subset))
    return tuple(out)
