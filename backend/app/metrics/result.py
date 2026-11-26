"""NumDen → MetricResult in unit form (K-15, D-25). UNDEFINED exactly at denominator 0 or missing input."""

from __future__ import annotations

from fractions import Fraction

from ..contracts.common import Rational
from ..contracts.f06 import (Aggregation, CaseSubset, EvaluatedRelation, MetricAux, MetricId, MetricResult,
                             MetricStatus, UndefinedReason)
from ..core.rational import to_pair
from .views import NumDen

METRIC_VERSION = "1.0.0"
_AUX_FIELDS = set(MetricAux.model_fields)


def rational(x: Fraction) -> Rational:
    n, d = to_pair(x)
    return Rational(n=n, d=d)


def _aux(nd: NumDen | None) -> MetricAux:
    if nd is None:
        return MetricAux()
    data: dict[str, object] = {}
    for k, v in nd.aux.items():
        if k not in _AUX_FIELDS or v is None:
            continue
        data[k] = rational(v) if isinstance(v, Fraction) else v
    return MetricAux.model_validate(data)


def make_result(metric_id: MetricId, nd: NumDen | None, *, relation: EvaluatedRelation,
                aggregation: Aggregation, reference_space: str, tick: int | None = None,
                case_subset: CaseSubset | None = None) -> MetricResult:
    base = dict(metric_id=metric_id, version=METRIC_VERSION, reference_space=reference_space, tick=tick,
                relation=relation, case_subset=case_subset, aggregation=aggregation, aux=_aux(nd))
    if nd is None:
        return MetricResult(value=None, status=MetricStatus.UNDEFINED,
                            undefined_reason=UndefinedReason.INPUT_MISSING, **base)  # type: ignore[arg-type]
    num, den = rational(nd.numerator), rational(nd.denominator)
    if nd.denominator == 0:
        return MetricResult(value=None, status=MetricStatus.UNDEFINED, numerator=num, denominator=den,
                            undefined_reason=UndefinedReason.ZERO_DENOMINATOR,
                            **base)  # type: ignore[arg-type]
    return MetricResult(value=float(nd.numerator / nd.denominator), status=MetricStatus.EVALUATED,
                        numerator=num, denominator=den, **base)  # type: ignore[arg-type]


def exact_value(r: MetricResult) -> Fraction | None:
    if r.numerator is None or r.denominator is None or r.denominator.n == 0:
        return None
    return Fraction(r.numerator.n, r.numerator.d) / Fraction(r.denominator.n, r.denominator.d)
