"""contracts.f06 — F06_METRICS (Kap. 08.7), incl. AttributeMembership (K-63), class_key (K-65)."""

from __future__ import annotations

from enum import Enum

from pydantic import model_validator

from .common import (ArtifactRef, ContentHash, DataOrigin, ErrorRecord, ExecutionStatus, Frozen,
                     Rational, SemVer, StableId, StrategyRef, Text, Tick)


class MetricId(str, Enum):
    M01 = "M01"
    M02 = "M02"
    M03 = "M03"
    M04 = "M04"
    M05 = "M05"
    M06 = "M06"
    M07 = "M07"
    M08 = "M08"
    M09 = "M09"
    M10 = "M10"
    M11 = "M11"


class EvaluatedRelation(str, Enum):
    A = "A"
    O = "O"  # noqa: E741
    R = "R"
    A_O = "A_O"
    A_R = "A_R"
    ANNOTATION_R = "ANNOTATION_R"
    R1_R2 = "R1_R2"
    BASELINE_RECOVERY = "BASELINE_RECOVERY"


class CaseSubset(str, Enum):
    ALL = "ALL"
    OBSERVABLE_CASES = "OBSERVABLE_CASES"


class MetricDefinition(Frozen):
    metric_id: MetricId
    version: SemVer
    name: Text
    formula: Text
    target_value: Rational
    relations: tuple[EvaluatedRelation, ...]
    tick_set: Text
    unit: str = "ratio"


class WeightEntry(Frozen):
    attribute_ref: StableId
    weight: Rational

    @model_validator(mode="after")
    def _pos(self) -> "WeightEntry":
        if self.weight.n == 0:
            raise ValueError("weights must be > 0")
        return self


class WeightSet(Frozen):
    weight_set_id: StableId
    version: SemVer
    default_weight: Rational = Rational(n=1, d=1)
    weights: tuple[WeightEntry, ...] = ()


class ReferenceSpaceKind(str, Enum):
    ATTRIBUTE = "ATTRIBUTE"
    RULE = "RULE"
    TRANSITION = "TRANSITION"
    TICK = "TICK"
    CASE = "CASE"
    RULE_KEY = "RULE_KEY"


class ReferenceSpace(Frozen):
    reference_space_id: StableId
    kind: ReferenceSpaceKind
    tick: Tick | None = None
    members: tuple[str, ...]
    weight_set_ref: StableId | None = None
    space_hash: ContentHash


class Aggregation(str, Enum):
    PER_TICK = "PER_TICK"
    POOLED = "POOLED"
    TIME_MEAN_EXPLICIT = "TIME_MEAN_EXPLICIT"


class MetricStatus(str, Enum):
    EVALUATED = "EVALUATED"
    UNDEFINED = "UNDEFINED"


class UndefinedReason(str, Enum):
    ZERO_DENOMINATOR = "ZERO_DENOMINATOR"
    INPUT_MISSING = "INPUT_MISSING"


class MetricAux(Frozen):
    undetermined_count: int | None = None
    hypotheses_excluded: int | None = None
    unevaluable_count: int | None = None
    not_in_validity: int | None = None
    not_applicable_excluded: int | None = None
    stale_known: int | None = None
    tp: int | None = None
    fp: int | None = None
    fn: int | None = None
    observable_cases: int | None = None
    shared_coverage: Rational | None = None
    shared_coverage_undefined: bool | None = None
    persisting: int | None = None
    new_inconsistencies: int | None = None
    unevaluable_in_recovery: int | None = None
    function_ref: StableId | None = None
    ticks_included: int | None = None
    ticks_excluded: int | None = None


class MetricResult(Frozen):
    metric_id: MetricId
    value: float | None
    status: MetricStatus
    undefined_reason: UndefinedReason | None = None
    unit: str = "ratio"
    version: SemVer
    reference_space: StableId
    numerator: Rational | None = None
    denominator: Rational | None = None
    tick: Tick | None = None
    relation: EvaluatedRelation
    case_subset: CaseSubset | None = None
    aggregation: Aggregation
    aux: MetricAux = MetricAux()

    @model_validator(mode="after")
    def _inv(self) -> "MetricResult":
        evaluated = self.status is MetricStatus.EVALUATED
        if evaluated != (self.value is not None):
            raise ValueError("EVALUATED ⇔ value ≠ null")
        if evaluated:
            if self.denominator is None or self.numerator is None or self.denominator.n == 0:
                raise ValueError("EVALUATED needs numerator and denominator > 0")
            if self.value is not None and not 0.0 <= self.value <= 1.0:
                raise ValueError("value must be in [0, 1]")
            if self.undefined_reason is not None:
                raise ValueError("EVALUATED has no undefined_reason")
        elif self.undefined_reason is None:
            raise ValueError("UNDEFINED needs undefined_reason (D-25)")
        return self


class Verdict(str, Enum):
    TP = "TP"
    FN = "FN"
    FP = "FP"


class GapMatch(Frozen):
    tick: Tick
    case_id: StableId | None = None
    gap_id: StableId | None = None
    verdict: Verdict
    observable: bool | None = None
    matcher: StrategyRef
    class_key: tuple[StableId, ...] = ()  # K-65


class AttributeMembership(Frozen):  # K-63
    tick: Tick
    attribute_ref: StableId
    in_d_ref: bool
    in_d_obs: bool
    in_d_det: bool
    delta: int | None = None
    weight: Rational


class EvaluationReport(Frozen):
    report_key: StableId
    version: SemVer
    inputs: tuple[ArtifactRef, ...]
    reference_spaces: tuple[ReferenceSpace, ...]
    results: tuple[MetricResult, ...]
    rule_evaluations: tuple[ArtifactRef, ...]
    gap_matches: tuple[GapMatch, ...]
    strategies: tuple[StrategyRef, ...]
    errors: tuple[ErrorRecord, ...] = ()
    execution_status: ExecutionStatus
    data_origin: DataOrigin
    attribute_membership: tuple[AttributeMembership, ...] = ()


class ComparisonReport(Frozen):
    comparison_key: StableId
    baseline_experiment_id: StableId
    recovery_experiment_id: StableId
    fixture_lineage_id: StableId
    comparison_tick: Tick
    compatible: bool
    incompatibility: tuple[Text, ...] = ()
    original: tuple[str, ...] = ()
    resolved: tuple[str, ...] = ()
    persisting: tuple[str, ...] = ()
    unevaluable_in_recovery: tuple[str, ...] = ()
    new: tuple[str, ...] = ()
    results: tuple[MetricResult, ...] = ()
    basis: StrategyRef
