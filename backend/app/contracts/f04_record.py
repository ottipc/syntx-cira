"""contracts.f04_record — F04 parts NOT visible to F05 (Kap. 08.5, K-65)."""

from __future__ import annotations

from typing import Literal

from .common import ArtifactRef, Frozen, ObservationStatus, SemVer, StableId, Symbol, Tick
from .f03 import ActualState  # noqa: F401  (record links Ω_A; kept here, never in f04_public)
from .f04_public import BudgetUsage, ContextBundle, ObservationSource, SourceReferenceRegister


class BundleBudget(Frozen):
    max_observations: int
    max_bytes: int


class ObservationConfig(Frozen):
    config_id: StableId
    version: SemVer
    sources: tuple[ObservationSource, ...]
    visible_nodes: tuple[StableId, ...]
    visible_relations: tuple[StableId, ...]
    visible_rules: tuple[StableId, ...]
    bundle_budget: BundleBudget
    serialization_profiles: tuple[str, ...]


class ObservationRecord(Frozen):
    bundle_ref: ArtifactRef
    tick: Tick
    actual_state_refs: tuple[ArtifactRef, ...]
    observation_config_ref: ArtifactRef


class ProjectedValue(Frozen):
    attribute_ref: StableId
    status: ObservationStatus
    value: Symbol | None = None
    stale: bool = False
    observed_at_tick: Tick | None = None
    source_id: StableId | None = None


class OValueState(Frozen):
    status: ObservationStatus
    value: Symbol | None = None


class OChange(Frozen):
    attribute_ref: StableId
    before: OValueState
    after: OValueState


class DeltaStateO(Frozen):  # K-13
    space: Literal["O"]
    from_tick: Tick
    to_tick: Tick
    changes: tuple[OChange, ...]


class ObservationProjectionBody(Frozen):
    context: ContextBundle
    projected: tuple[ProjectedValue, ...]
    source_register: SourceReferenceRegister
    bundle_budget: BundleBudget          # K-65
    budget_usage: BudgetUsage            # K-65
    serialization_profile: str           # K-65
    revision: int                        # K-65
    visible_nodes: tuple[StableId, ...]  # K-65
    delta: DeltaStateO | None = None     # K-65
