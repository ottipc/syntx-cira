"""contracts.f02 — F02_GOVERNANCE (Kap. 08.3), incl. AuthorityRecord (K-08) and summary (K-64)."""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import Field, model_validator

from .common import (ArtifactRef, Frozen, RuleResult, SemVer, StableId, StateSpace, Symbol, Text,
                     Tick)


class RuleKind(str, Enum):
    STATE = "STATE"
    TRANSITION = "TRANSITION"
    FUNCTION = "FUNCTION"


class TimeIndex(str, Enum):
    CURRENT = "CURRENT"
    NEXT = "NEXT"


class SymbolPair(Frozen):
    from_: Symbol = Field(alias="from")
    to: Symbol


class Eq(Frozen):
    op: Literal["eq"]
    attr: StableId
    value: Symbol
    at: TimeIndex | None = None


class In(Frozen):
    op: Literal["in"]
    attr: StableId
    values: tuple[Symbol, ...]
    at: TimeIndex | None = None


class Not(Frozen):
    op: Literal["not"]
    arg: "Predicate"


class And(Frozen):
    op: Literal["and"]
    args: tuple["Predicate", ...] = Field(min_length=2)


class Or(Frozen):
    op: Literal["or"]
    args: tuple["Predicate", ...] = Field(min_length=2)


class Implies(Frozen):
    op: Literal["implies"]
    if_: "Predicate" = Field(alias="if")
    then: "Predicate"


class TransitionIn(Frozen):
    op: Literal["transition_in"]
    attr: StableId
    allowed: tuple[SymbolPair, ...]


Predicate = Annotated[Union[Eq, In, Not, And, Or, Implies, TransitionIn], Field(discriminator="op")]
for _m in (Not, And, Or, Implies):
    _m.model_rebuild()


def _leaves(p: object) -> list[object]:
    if isinstance(p, (Eq, In, TransitionIn)):
        return [p]
    if isinstance(p, Not):
        return _leaves(p.arg)
    if isinstance(p, (And, Or)):
        return [x for a in p.args for x in _leaves(a)]
    if isinstance(p, Implies):
        return _leaves(p.if_) + _leaves(p.then)
    return []


def predicate_attributes(p: object) -> list[str]:
    return [leaf.attr for leaf in _leaves(p)]  # type: ignore[attr-defined]


class RoleDecl(Frozen):
    role_id: StableId
    label: Text


class Rule(Frozen):
    rule_id: StableId
    version: SemVer
    kind: RuleKind
    scope: tuple[StableId, ...] = ()
    applies_to: tuple[StableId, ...] = ()
    requires: tuple[StableId, ...] = ()
    permits: tuple[StableId, ...] = ()
    valid_from_tick: Tick = 0
    valid_until_tick: Tick | None = None
    expression: Predicate
    description: Text = ""

    @model_validator(mode="after")
    def _time_index(self) -> "Rule":
        for leaf in _leaves(self.expression):
            if isinstance(leaf, TransitionIn):
                if self.kind is not RuleKind.TRANSITION:
                    raise ValueError("transition_in only in TRANSITION rules")
            elif self.kind is RuleKind.TRANSITION and getattr(leaf, "at") is None:
                raise ValueError("TRANSITION leaves need 'at' (K-06)")
            elif self.kind is not RuleKind.TRANSITION and getattr(leaf, "at") is not None:
                raise ValueError("'at' only in TRANSITION rules (K-06)")
        if self.valid_until_tick is not None and self.valid_until_tick < self.valid_from_tick:
            raise ValueError("valid_until_tick < valid_from_tick")
        return self

    def valid_at(self, t: int) -> bool:
        return self.valid_from_tick <= t and (self.valid_until_tick is None or t <= self.valid_until_tick)


class Decision3(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PENDING = "PENDING"


class ApprovalRecord(Frozen):
    approval_id: StableId
    role_ref: StableId
    rule_ref: StableId | None = None
    subject_refs: tuple[StableId, ...] = ()
    decision: Decision3
    tick: Tick
    rationale: Text = ""


class Decision2(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AuthorityRecord(Frozen):
    decision_id: StableId
    role_ref: StableId
    proposal_ref: ArtifactRef
    decision: Decision2
    rationale: Text
    created_scenario_ref: ArtifactRef | None = None


class GovernanceDefinition(Frozen):
    governance_id: StableId
    version: SemVer
    topology_ref: ArtifactRef
    roles: tuple[RoleDecl, ...]
    rules: tuple[Rule, ...]


class EvalReason(str, Enum):
    OK = "OK"
    UNKNOWN_INPUT = "UNKNOWN_INPUT"
    UNDETERMINED_INPUT = "UNDETERMINED_INPUT"
    NOT_APPLICABLE_INPUT = "NOT_APPLICABLE_INPUT"
    REQUIREMENT_NOT_MET = "REQUIREMENT_NOT_MET"


class RuleEvaluation(Frozen):
    rule_ref: StableId
    rule_version: SemVer
    space: StateSpace
    tick: Tick
    tick_to: Tick | None = None
    result: RuleResult
    reason: EvalReason
    input_attribute_refs: tuple[StableId, ...] = ()


class RuleSummary(Frozen):
    true: int
    false: int
    unevaluable: int
    not_in_validity: int


class RuleEvaluationSet(Frozen):
    governance_ref: ArtifactRef
    space: StateSpace
    tick: Tick
    evaluations: tuple[RuleEvaluation, ...]
    not_in_validity: int
    summary: RuleSummary  # K-64


class RuleView(Frozen):
    rule_id: StableId
    version: SemVer
    kind: RuleKind
    description: Text
    applies_to: tuple[StableId, ...]
