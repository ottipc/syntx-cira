"""contracts.f03 — F03_EMULATOR and the experiment definition (Kap. 08.4). No import of f04_record/f05."""

from __future__ import annotations

from enum import Enum

from pydantic import model_validator

from .common import (AdapterKind, Applicability, ArtifactRef, ContentOpenness, DataOrigin, ErrorRecord,
                     ExecutionStatus, Frozen, SemVer, StableId, StageName, StrategyRef, Symbol, Text,
                     Tick, Seq)
from .f02 import ApprovalRecord


class InputEventKind(str, Enum):
    SET_ATTRIBUTE = "SET_ATTRIBUTE"
    APPLY_APPROVAL = "APPLY_APPROVAL"


class InputEvent(Frozen):
    event_id: StableId
    tick: Tick
    seq: Seq
    kind: InputEventKind
    attribute_ref: StableId | None = None
    value: Symbol | None = None
    approval: ApprovalRecord | None = None

    @model_validator(mode="after")
    def _kind(self) -> "InputEvent":
        if self.kind is InputEventKind.SET_ATTRIBUTE and (self.attribute_ref is None or self.value is None):
            raise ValueError("SET_ATTRIBUTE needs attribute_ref and value")
        if self.kind is InputEventKind.APPLY_APPROVAL and (self.approval is None or self.attribute_ref is None):
            raise ValueError("APPLY_APPROVAL needs approval and attribute_ref")
        return self


class ActualValue(Frozen):
    attribute_ref: StableId
    applicability: Applicability
    value: Symbol | None = None

    @model_validator(mode="after")
    def _value(self) -> "ActualValue":
        if (self.applicability is Applicability.APPLICABLE) != (self.value is not None):
            raise ValueError("APPLICABLE ⇔ value ≠ null")
        return self


class VariantKind(str, Enum):
    BASELINE = "BASELINE"
    RECOVERY = "RECOVERY"


class ScenarioDefinition(Frozen):
    scenario_id: StableId
    version: SemVer
    variant_kind: VariantKind
    variant_of: ArtifactRef | None = None
    derived_from_proposal: ArtifactRef | None = None
    authority_ref: ArtifactRef | None = None
    fixture_lineage_id: StableId
    topology_ref: ArtifactRef
    governance_ref: ArtifactRef
    initial_state: tuple[ActualValue, ...]
    inputs: tuple[InputEvent, ...]
    tick_count: int
    service_function_refs: tuple[StableId, ...] = ()
    is_fixture: bool
    label: Text = ""

    @model_validator(mode="after")
    def _recovery(self) -> "ScenarioDefinition":
        if self.tick_count < 1:
            raise ValueError("tick_count >= 1")
        if self.variant_kind is VariantKind.RECOVERY:
            if self.variant_of is None:
                raise ValueError("RECOVERY needs variant_of")
            if not self.is_fixture and self.authority_ref is None:
                raise ValueError("non-fixture RECOVERY needs authority_ref (P11)")
        return self


class ConsistencyCase(Frozen):
    case_id: StableId
    kind: str
    subject_refs: tuple[StableId, ...]
    rule_ref: StableId | None = None
    tick_from: Tick
    tick_to: Tick | None = None


class ConsistencyAnnotationSet(Frozen):
    scenario_ref: ArtifactRef
    cases: tuple[ConsistencyCase, ...]


class AttributeChange(Frozen):
    attribute_ref: StableId
    before: Symbol | None = None
    after: Symbol | None = None


class EventStatus(str, Enum):
    APPLIED = "APPLIED"
    REJECTED = "REJECTED"  # K-66: only APPLY_APPROVAL by a role without permits


class EventRecord(Frozen):
    seq: Seq
    tick: Tick
    event_ref: StableId
    kind: InputEventKind
    status: EventStatus
    effects: tuple[AttributeChange, ...] = ()
    error: ErrorRecord | None = None


class ActualState(Frozen):
    scenario_ref: ArtifactRef
    tick: Tick
    last_seq: Seq | None = None
    values: tuple[ActualValue, ...]

    @model_validator(mode="after")
    def _sorted(self) -> "ActualState":
        refs = [v.attribute_ref for v in self.values]
        if refs != sorted(refs) or len(set(refs)) != len(refs):
            raise ValueError("values must be sorted and unique by attribute_ref")
        return self


class ReferenceState(Frozen):
    actual_state_ref: ArtifactRef
    annotation_ref: ArtifactRef | None = None


class AdapterSelection(Frozen):
    kind: AdapterKind
    config_ref: StableId
    merge_policy: StrategyRef


class ScheduleMode(str, Enum):
    FINAL = "FINAL"
    EVERY_TICK = "EVERY_TICK"
    EXPLICIT = "EXPLICIT"


class SweepSchedule(Frozen):
    mode: ScheduleMode
    ticks: tuple[Tick, ...] = ()


class StabilityConfig(Frozen):
    enabled: bool = True
    tick: Tick | None = None


class MetricConfig(Frozen):
    weight_set_ref: StableId
    comparison_tick: Tick | None = None
    hypothesis_policy: StrategyRef
    coverage_weighting: StrategyRef
    service_function_spaces: StrategyRef
    closure_basis: StrategyRef
    stability_source: StrategyRef
    gap_matcher: StrategyRef


class ObservationStrategy(Frozen):
    budget_unit: StrategyRef


class ReplayMode(str, Enum):
    SYNTHETIC = "SYNTHETIC"
    PRESERVED_ENGINE = "PRESERVED_ENGINE"


class ExperimentDefinition(Frozen):
    definition_version: SemVer
    scenario_ref: ArtifactRef
    observation_config_ref: ArtifactRef
    target_definition_ref: ArtifactRef  # mandatory (K-11)
    adapter: AdapterSelection
    sweep_schedule: SweepSchedule
    stability: StabilityConfig
    metric_config: MetricConfig
    observation_strategy: ObservationStrategy
    replay_of: StableId | None = None
    replay_mode: ReplayMode | None = None
    label: Text = ""


class StageStatus(Frozen):
    stage: StageName
    status: ExecutionStatus


class TickBounds(Frozen):
    first: Tick
    last: Tick


class SweepSummary(Frozen):
    sweep_id: StableId
    direction: str
    up_to_tick: Tick
    attempt: int
    execution_status: ExecutionStatus
    data_origin: DataOrigin


class ExperimentView(Frozen):
    """Projection from StageEvents (K-35), not an artifact; fields from label on: K-59."""

    experiment_id: StableId
    definition_ref: ArtifactRef
    status: ExecutionStatus
    stage_status: tuple[StageStatus, ...]
    openness: ContentOpenness
    errors: tuple[ErrorRecord, ...] = ()
    label: Text = ""
    data_origin: DataOrigin
    ticks: TickBounds
    sweeps: tuple[SweepSummary, ...] = ()
    comparisons: tuple[StableId, ...] = ()
