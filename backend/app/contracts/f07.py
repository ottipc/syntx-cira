"""contracts.f07 — projections and session (Kap. 08.8, K-58)."""

from __future__ import annotations

from enum import Enum
from typing import Generic, TypeVar

from pydantic import Field

from .common import (ArtifactRef, ContentAvailability, DataOrigin, ErrorRecord, Frozen, SchemaVersion,
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
