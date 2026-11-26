"""View types — the only code shared between the metric kernel and the oracle (07.11, U-05).

Views are plain frozen dataclasses over Fractions. F06 builds them from the three state spaces; the
kernel never touches artifacts directly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from fractions import Fraction


@dataclass(frozen=True)
class AttrState:
    """One attribute at one tick across Ω_A, Ω_O, Ω_R (06.5)."""

    attribute: str
    a_applicable: bool
    a_value: str | None
    o_status: str  # KNOWN | UNKNOWN | NOT_APPLICABLE
    o_value: str | None = None
    o_stale: bool = False
    r_status: str | None = None  # DETERMINED | UNDETERMINED | NOT_APPLICABLE | None (no sweep at tick)
    r_value: str | None = None
    r_class: str | None = None


@dataclass(frozen=True)
class TickView:
    tick: int
    attrs: tuple[AttrState, ...]
    sweep_tick: bool = True


@dataclass(frozen=True)
class Weights:
    default: Fraction = Fraction(1)
    explicit: tuple[tuple[str, Fraction], ...] = ()

    def w(self, attribute: str) -> Fraction:
        for a, v in self.explicit:
            if a == attribute:
                return v
        return self.default


@dataclass(frozen=True)
class RuleTickView:
    """Rule results for one space at one tick (STATE/FUNCTION) or tick pair (TRANSITION)."""

    tick: int
    results: tuple[tuple[str, str], ...]  # (rule_id, TRUE|FALSE|UNEVALUABLE) for rules in validity
    not_in_validity: int = 0


@dataclass(frozen=True)
class FunctionSeries:
    function_ref: str
    values: tuple[tuple[int, str], ...]  # (tick, TRUE|FALSE|UNEVALUABLE)


@dataclass(frozen=True)
class CaseView:
    case_id: str
    nodes: frozenset[str]
    tick_from: int
    tick_to: int | None = None

    def active(self, t: int) -> bool:
        return self.tick_from <= t and (self.tick_to is None or t <= self.tick_to)


@dataclass(frozen=True)
class GapView:
    gap_id: str
    tick: int
    nodes: frozenset[str]


@dataclass(frozen=True)
class ClosureView:
    """Ω_A STATE-rule results at τ for baseline and recovery, keyed by (rule_id, scope)."""

    baseline: tuple[tuple[str, str], ...]
    recovery: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class StabilityView:
    reference: tuple[str, ...]  # D_ref at τ
    r1: tuple[tuple[str, str], ...]  # (attribute, value) for D_det(R1)
    r2: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class NumDen:
    numerator: Fraction
    denominator: Fraction
    aux: dict[str, object] = field(default_factory=dict)
