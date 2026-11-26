"""T02 / T04 — contract roundtrip and property tests; separated state models (REQ-002, 005, 006, 015, 025, 050, 063–068)."""

from __future__ import annotations

import json
from typing import Any

import pytest
from hypothesis import given
from hypothesis import strategies as st
from pydantic import BaseModel, ValidationError

from app.contracts import common, f03, f04_public, f05, f06
from app.contracts.registry import ARTIFACT_TYPES

pytestmark = [pytest.mark.tid("T02")]


@pytest.mark.req("REQ-063")
@pytest.mark.parametrize("name", sorted(ARTIFACT_TYPES))
def test_config_forbid_strict_frozen(name: str) -> None:
    m = ARTIFACT_TYPES[name]
    cfg = m.model_config
    assert cfg.get("extra") == "forbid" and cfg.get("strict") is True and cfg.get("frozen") is True


def _no_lists(model: type[BaseModel], seen: set[type[BaseModel]]) -> None:
    if model in seen:
        return
    seen.add(model)
    for name, f in model.model_fields.items():
        ann = str(f.annotation)
        assert "list[" not in ann and "dict[" not in ann and "set[" not in ann, f"{model.__name__}.{name}: {ann}"


@pytest.mark.req("REQ-063")
def test_deeply_immutable_tuples_only() -> None:
    seen: set[type[BaseModel]] = set()
    for m in ARTIFACT_TYPES.values():
        _no_lists(m, seen)


@pytest.mark.req("REQ-064")
@given(st.integers(0, 10**6), st.integers(1, 10**6))
def test_rational_roundtrip_property(n: int, d: int) -> None:
    from math import gcd
    g = gcd(n, d)
    r = common.Rational(n=n // g, d=d // g)
    assert common.Rational.model_validate_json(r.model_dump_json()) == r
    if g != 1:
        with pytest.raises(ValidationError):
            common.Rational(n=n, d=d)


@pytest.mark.req("REQ-064")
@pytest.mark.req("REQ-050")
@given(st.integers(0, 50), st.integers(1, 50), st.sampled_from(list(f06.Aggregation)), st.one_of(st.none(), st.integers(0, 9)))
def test_metric_result_roundtrip_property(n: int, d: int, agg: f06.Aggregation, tick: int | None) -> None:
    from fractions import Fraction

    from app.metrics.result import make_result
    from app.metrics.views import NumDen
    n = min(n, d)
    r = make_result(f06.MetricId.M05, NumDen(Fraction(n), Fraction(d)), relation=f06.EvaluatedRelation.A_R,
                    aggregation=agg, reference_space="space:x", tick=tick)
    assert f06.MetricResult.model_validate_json(r.model_dump_json()) == r
    assert r.value == n / d


@pytest.mark.req("REQ-042")
def test_metric_result_invariants() -> None:
    base: dict[str, Any] = {"metric_id": "M01", "version": "1.0.0", "reference_space": "space:x", "relation": "A_R",
                            "aggregation": "POOLED"}
    with pytest.raises(ValidationError):
        f06.MetricResult.model_validate_json(json.dumps({**base, "value": None, "status": "UNDEFINED"}))
    with pytest.raises(ValidationError):
        f06.MetricResult.model_validate_json(json.dumps({**base, "value": 0.5, "status": "UNDEFINED",
                                                         "undefined_reason": "ZERO_DENOMINATOR"}))
    with pytest.raises(ValidationError):
        f06.MetricResult.model_validate_json(json.dumps({**base, "value": 1.5, "status": "EVALUATED",
                                                         "numerator": {"n": 3, "d": 1}, "denominator": {"n": 2, "d": 1}}))


@pytest.mark.tid("T04")
@pytest.mark.req("REQ-002")
@pytest.mark.req("REQ-025")
def test_state_models_are_disjoint_types() -> None:
    a, o, r = f03.ActualValue, f04_public.Observation, f05.ReconstructedValue
    for x, y in ((a, o), (a, r), (o, r)):
        assert not issubclass(x, y) and not issubclass(y, x)
        common_bases = set(x.__mro__) & set(y.__mro__)
        assert common_bases <= {common.Frozen, BaseModel, object}
    # distinct status vocabularies
    assert {s.value for s in common.ObservationStatus} == {"KNOWN", "UNKNOWN", "NOT_APPLICABLE"}
    assert {s.value for s in common.ReconstructionStatus} == {"DETERMINED", "UNDETERMINED", "NOT_APPLICABLE"}
    assert {s.value for s in common.Applicability} == {"APPLICABLE", "NOT_APPLICABLE"}


@pytest.mark.tid("T04")
@pytest.mark.req("REQ-025")
@pytest.mark.parametrize("bad", [
    (f04_public.Observation, {"observation_id": "obs:s:n/a:t0", "tick": 0, "observed_at_tick": 0,
                              "attribute_ref": "attr:n/a", "status": "UNKNOWN", "value": "X"}),
    (f04_public.Observation, {"observation_id": "obs:s:n/a:t0", "tick": 0, "observed_at_tick": 0,
                              "attribute_ref": "attr:n/a", "status": "KNOWN", "value": "X"}),
    (f04_public.Observation, {"observation_id": "obs:s:n/a:t0", "source_id": "src:s", "tick": 0, "observed_at_tick": 1,
                              "attribute_ref": "attr:n/a", "status": "KNOWN", "value": "X"}),
    (f03.ActualValue, {"attribute_ref": "attr:n/a", "applicability": "APPLICABLE"}),
    (f03.ActualValue, {"attribute_ref": "attr:n/a", "applicability": "NOT_APPLICABLE", "value": "X"}),
    (f05.ReconstructedValue, {"attribute_ref": "attr:n/a", "status": "DETERMINED", "value": "X",
                              "epistemic_class": "OPEN_REFERENCE"}),
    (f05.ReconstructedValue, {"attribute_ref": "attr:n/a", "status": "UNDETERMINED", "value": "X"}),
    (f04_public.Observation, {"observation_id": "obs:s:n/a:t0", "tick": 0, "observed_at_tick": 0,
                              "attribute_ref": "attr:n/a", "status": "FALSE"}),
])
def test_state_validators(bad: tuple[type[BaseModel], dict[str, Any]]) -> None:
    cls, data = bad
    with pytest.raises(ValidationError):
        cls.model_validate_json(json.dumps(data))


@pytest.mark.req("REQ-005")
@pytest.mark.req("REQ-006")
@pytest.mark.req("REQ-068")
def test_closed_vocabularies() -> None:
    assert [c.value for c in common.CouplingStatus] == ["EFFECTIVE", "POSSIBLE", "UNKNOWN_OPEN"]
    assert len(common.EpistemicClass) == 5
    assert "CREATED" in common.ExecutionStatus.__members__
    assert set(common.ContentOpenness.model_fields) >= {"undetermined", "open_references", "structural_gaps_open"}


@pytest.mark.req("REQ-015")
def test_definition_and_evaluation_are_distinct_types() -> None:
    from app.contracts import f02
    assert not set(f02.Rule.model_fields) & {"result", "reason"}
    assert {"result", "reason"} <= set(f02.RuleEvaluation.model_fields)


