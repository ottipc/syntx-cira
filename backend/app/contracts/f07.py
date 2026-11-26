"""contracts.f07 — projections and session (Kap. 08.8, K-58)."""

from __future__ import annotations

from enum import Enum
from typing import Generic, TypeVar

from pydantic import Field

from .common import (ArtifactRef, ContentAvailability, DataOrigin, ErrorRecord, Frozen, SchemaVersion, StrategyRef,
                     StableId, Tick)
from .f06 import Aggregation


class ViewId(str, Enum):
    SYSTEM_FIELD_OVERVIEW = "SYSTEM_FIELD_OVERVIEW"
    TOPOLOGY_GRAPH = "TOPOLOGY_GRAPH"
    TEMPORAL_STATE_EXPLORER = "TEMPORAL_STATE_EXPLORER"
    OBSERVATION_INSPECTOR = "OBSERVATION_INSPECTOR"
    FORWARD_SWEEP_INSPECTOR = "FORWARD_SWEEP_INSPECTOR"
    INVERSE_SWEEP_INSPECTOR = "INVERSE_SWEEP_INSPECTOR"
    STRUCTURAL_GAP_INSPECTOR = "STRUCTURAL_GAP_INSPECTOR"
    ARCHITECTURAL_CLOSURE_INSPECTOR = "ARCHITECTURAL_CLOSURE_INSPECTOR"
    STRUCTURAL_METRICS = "STRUCTURAL_METRICS"
    SCENARIO_COMPARISON = "SCENARIO_COMPARISON"
    EVENT_TIMELINE = "EVENT_TIMELINE"


class GuardClass(str, Enum):
    TIMED = "TIMED"
    TIMELESS = "TIMELESS"
    RANGE = "RANGE"
    COMPARISON = "COMPARISON"
    GLOBAL = "GLOBAL"


class QueryEcho(Frozen):
    attempt: int | None = None
    revision: int | None = None
    direction: str | None = None
    aggregation: Aggregation | None = None
    to_tick: Tick | None = None
    from_: Tick | None = Field(default=None, alias="from")
    to: Tick | None = None
    comparison_id: StableId | None = None


class ProjectionHeader(Frozen):
    experiment_id: StableId | None
    tick: Tick | None
    schema_version: SchemaVersion
    data_origin: DataOrigin
    source_refs: tuple[ArtifactRef, ...] = ()
    guard_class: GuardClass
    query_echo: QueryEcho = QueryEcho()


T = TypeVar("T")


class Block(Frozen, Generic[T]):
    availability: ContentAvailability
    origin: DataOrigin | None = None
    content: T | None = None


class Lang(str, Enum):
    en = "en"
    de = "de"


class Mode(str, Enum):
    standard = "standard"
    presentation = "presentation"


class ExperimentSession(Frozen):
    experiment_id: StableId
    view: ViewId
    tick: Tick
    attempt: int = 0
    revision: int | None = None
    comparison_id: StableId | None = None
    aggregation: Aggregation | None = None
    to_tick: Tick | None = None
    from_: Tick | None = Field(default=None, alias="from")
    to: Tick | None = None
    focus: StableId | None = None
    filter: str | None = None
    lang: Lang = Lang.en
    mode: Mode = Mode.standard
    demo_step: int | None = None


class ViewStatus(str, Enum):
    IDLE = "IDLE"
    LOADING = "LOADING"
    READY = "READY"
    VIEW_DATA_UNAVAILABLE = "VIEW_DATA_UNAVAILABLE"


class ViewState(Frozen):
    status: ViewStatus
    data_experiment_id: StableId | None = None
    data_tick: Tick | None = None
    error: ErrorRecord | None = None


# ---- projection responses (Kap. 10, K-58–K-65). Not artifacts: no IDs, no replay effect. ------------------------
from .common import AdapterKind, ErrorCodeC, FieldId, StageEvent, StateSpace  # noqa: E402
from .experiments import ReplayReport  # noqa: E402
from .f01 import TopologyProjectionBody  # noqa: E402
from .f02 import AuthorityRecord, RuleEvaluationSet, RuleView  # noqa: E402
from .f03 import ActualValue, DeltaStateA, EventRecord, ExperimentView, VariantKind  # noqa: E402
from .f04_record import ObservationProjectionBody  # noqa: E402
from .f05 import AdapterDescriptor, ForwardResult, InverseResult, ReconstructionResult, RecoveryProposal, SweepRun  # noqa: E402
from .f05 import SweepTrace  # noqa: E402
from .f06 import ComparisonReport, EvaluationReport, MetricDefinition  # noqa: E402


class AdapterHealth(Frozen):
    descriptor: AdapterDescriptor
    available: bool


class HealthResponse(Frozen):
    status: str
    service_version: str
    schema_versions: tuple[str, ...]
    adapters: tuple[AdapterHealth, ...]


class ScenarioEntry(Frozen):
    scenario_id: StableId
    version: str
    variant_kind: VariantKind
    variant_of: StableId | None = None
    fixture_lineage_id: StableId
    tick_count: int
    is_fixture: bool
    label: str = ""
    observation_configs: tuple[StableId, ...] = ()  # K-61
    targets: tuple[StableId, ...] = ()              # K-61


class ScenariosResponse(Frozen):
    header: ProjectionHeader
    scenarios: tuple[ScenarioEntry, ...]


class Links(Frozen):
    self_: str = Field(alias="self")
    view: str


class CreatedResponse(Frozen):
    experiment_id: StableId
    status: str
    links: Links


class ExperimentViewResponse(Frozen):
    header: ProjectionHeader
    experiment: ExperimentView


class ExperimentListEntry(Frozen):
    experiment_id: StableId
    label: str
    scenario_id: StableId
    status: str
    data_origin: DataOrigin


class ExperimentsResponse(Frozen):
    header: ProjectionHeader
    experiments: tuple[ExperimentListEntry, ...]


class ObservationProjection(Frozen):
    header: ProjectionHeader
    observation: Block[ObservationProjectionBody]


class ResultsProjection(Frozen):
    header: ProjectionHeader
    forward: Block[ForwardResult]
    inverse: Block[InverseResult]
    reconstruction: Block[ReconstructionResult]
    proposals: tuple[RecoveryProposal, ...] = ()
    authority_records: tuple[AuthorityRecord, ...] = ()  # K-65


class MetricsProjection(Frozen):
    header: ProjectionHeader
    report: EvaluationReport
    definitions: tuple[MetricDefinition, ...]            # K-65


class TopologyProjection(Frozen):
    header: ProjectionHeader
    topology: TopologyProjectionBody


class GovernanceProjection(Frozen):
    header: ProjectionHeader
    rules: tuple[RuleView, ...]
    evaluations: Block[RuleEvaluationSet]


class StateProjection(Frozen):
    header: ProjectionHeader
    values: tuple[ActualValue, ...]
    delta: DeltaStateA | None = None                      # K-65


class EventsProjection(Frozen):
    header: ProjectionHeader
    events: tuple[EventRecord, ...]
    stage_events: tuple[StageEvent, ...]


class TraceProjection(Frozen):
    header: ProjectionHeader
    sweep: SweepRun
    trace: Block[SweepTrace]
    registry_labels: tuple[tuple[str, str], ...]


class SweepsCreated(Frozen):
    sweep_ids: tuple[StableId, ...]


class ImportCreated(Frozen):
    artifact_refs: tuple[ArtifactRef, ...]


class ReplayCreated(Frozen):
    experiment_id: StableId


class ReplayReportResponse(Frozen):
    header: ProjectionHeader
    report: ReplayReport


class ComparisonResponse(Frozen):
    header: ProjectionHeader
    comparison: ComparisonReport


class ComparisonListEntry(Frozen):
    comparison_id: StableId
    baseline: StableId
    recovery: StableId
    comparison_tick: Tick
    compatible: bool


class ComparisonsResponse(Frozen):
    header: ProjectionHeader
    comparisons: tuple[ComparisonListEntry, ...]


class FieldManifest(Frozen):
    field_id: FieldId
    name: str
    purpose: str
    package: str
    state_space: StateSpace | None = None
    writes: tuple[str, ...]
    reads: tuple[str, ...]
    ports: tuple[str, ...]
    stages: tuple[str, ...]
    stage_status: tuple[tuple[str, str], ...] = ()
    couplings_out: tuple[FieldId, ...]
    couplings_in: tuple[FieldId, ...]
    requirements: tuple[str, ...]


class Coupling(Frozen):
    source: FieldId
    target: FieldId
    carrier: str


class ConfigurationSnapshot(Frozen):
    experiment_id: StableId
    tick: Tick | None = None
    scenario_id: StableId
    observation_config_id: StableId
    target_id: StableId
    adapter_kind: AdapterKind
    sweep_schedule: str
    strategies: tuple[StrategyRef, ...]


class FieldsResponse(Frozen):
    header: ProjectionHeader
    manifests: tuple[FieldManifest, ...]
    coupling_matrix: tuple[Coupling, ...]
    configuration_snapshot: ConfigurationSnapshot | None = None


class RecoveryVariantCreated(Frozen):
    authority_ref: ArtifactRef
    scenario_ref: ArtifactRef | None = None


class ErrorDetail(Frozen):
    path: str
    issue: str


class ErrorBody(Frozen):
    code: ErrorCodeC
    message: str
    field: FieldId | None = None
    details: tuple[ErrorDetail, ...] = ()
    experiment_id: StableId | None = None


class ErrorResponse(Frozen):
    error: ErrorBody


PROJECTIONS: tuple[type[Frozen], ...] = (
    HealthResponse, ScenariosResponse, CreatedResponse, ExperimentViewResponse, ExperimentsResponse,
    ObservationProjection, ResultsProjection, MetricsProjection, TopologyProjection, GovernanceProjection,
    StateProjection, EventsProjection, TraceProjection, SweepsCreated, ImportCreated, ReplayCreated,
    ReplayReportResponse, ComparisonResponse, ComparisonsResponse, FieldsResponse, RecoveryVariantCreated,
    ErrorResponse)
