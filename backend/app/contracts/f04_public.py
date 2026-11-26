"""contracts.f04_public — the only F04 contract part visible to F05 (D-17, Kap. 08.5)."""

from __future__ import annotations

from enum import Enum

from pydantic import model_validator

from .common import Frozen, ObservationStatus, SemVer, StableId, Symbol, Text, Tick, TickRange
from .f01 import Node, Relation, ValueDomain
from .f02 import Rule


class ObservationSource(Frozen):
    source_id: StableId
    label: Text
    observes: tuple[StableId, ...]
    active: tuple[TickRange, ...]
    lag_ticks: int = 0

    def active_at(self, t: int) -> bool:
        return any(r.contains(t) for r in self.active)


class ObservableTopologyDefinition(Frozen):
    nodes: tuple[Node, ...]
    relations: tuple[Relation, ...]
    value_domains: tuple[ValueDomain, ...]


class ObservableRules(Frozen):
    rules: tuple[Rule, ...]


class Observation(Frozen):
    observation_id: StableId
    source_id: StableId | None = None
    tick: Tick
    observed_at_tick: Tick
    attribute_ref: StableId
    status: ObservationStatus
    value: Symbol | None = None
    references: tuple[StableId, ...] = ()

    @model_validator(mode="after")
    def _inv(self) -> "Observation":
        if (self.status is ObservationStatus.KNOWN) != (self.value is not None):
            raise ValueError("KNOWN ⇔ value ≠ null")
        if self.status is ObservationStatus.KNOWN and self.source_id is None:
            raise ValueError("KNOWN ⇒ source_id ≠ null (K-09)")
        if self.observed_at_tick > self.tick:
            raise ValueError("observed_at_tick <= tick")
        return self


class ContextBundle(Frozen):
    context_version: StableId
    sequence: int
    tick: Tick
    previous_context_ref: StableId | None = None
    observations: tuple[Observation, ...]


class Continuity(str, Enum):
    CONTINUOUS = "CONTINUOUS"
    INTERRUPTED = "INTERRUPTED"


class SourceRegisterEntry(Frozen):
    source_id: StableId
    first_tick: Tick
    last_tick: Tick
    continuity: Continuity
    gaps: tuple[TickRange, ...] = ()


class SourceReferenceRegister(Frozen):
    entries: tuple[SourceRegisterEntry, ...]


class BudgetUsage(Frozen):
    observations: int
    bytes: int


class ObservationBundle(Frozen):
    bundle_key: StableId
    up_to_tick: Tick
    contexts: tuple[ContextBundle, ...]
    observable_topology: ObservableTopologyDefinition
    observable_rules: ObservableRules
    source_register: SourceReferenceRegister
    serialization_profile: str
    budget_usage: BudgetUsage

    @model_validator(mode="after")
    def _contiguous(self) -> "ObservationBundle":
        seqs = [c.sequence for c in self.contexts]
        if seqs != list(range(len(seqs))):
            raise ValueError("contexts must be contiguous from sequence 0")
        return self


class GoalProperty(str, Enum):
    RULE_SATISFIED = "RULE_SATISFIED"
    ATTRIBUTE_EQUALS = "ATTRIBUTE_EQUALS"
    GAP_CLOSED = "GAP_CLOSED"


class TargetGoal(Frozen):
    goal_id: StableId
    subject_ref: StableId
    property: GoalProperty
    rule_ref: StableId | None = None
    value: Symbol | None = None


class TargetDefinition(Frozen):
    target_id: StableId
    version: SemVer
    goals: tuple[TargetGoal, ...]
    authored_by: Text
