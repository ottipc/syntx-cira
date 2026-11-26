"""Reference sets D_ref, D_obs, D_det and weights (07.1). Hypothesis policy S-04."""

from __future__ import annotations

from fractions import Fraction

from .views import AttrState, TickView, Weights

INCLUDE = "include"
EXCLUDE = "exclude"


def d_ref(v: TickView) -> list[AttrState]:
    return [a for a in v.attrs if a.a_applicable]


def d_obs(v: TickView) -> list[AttrState]:
    return [a for a in d_ref(v) if a.o_status == "KNOWN"]


def d_det(v: TickView, policy: str = INCLUDE) -> list[AttrState]:
    return [a for a in d_ref(v) if a.r_status == "DETERMINED"
            and (policy == INCLUDE or a.r_class != "HYPOTHESIS")]


def weight(s: list[AttrState], w: Weights) -> Fraction:
    return sum((w.w(a.attribute) for a in s), Fraction(0))


def delta(a: AttrState) -> int:
    return 0 if a.a_value == a.r_value else 1


def hypotheses_excluded(v: TickView, policy: str) -> int:
    if policy != EXCLUDE:
        return 0
    return sum(1 for a in d_ref(v) if a.r_status == "DETERMINED" and a.r_class == "HYPOTHESIS")
