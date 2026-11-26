"""Δ_S and Δ_K as pure functions (Kap. 07.8). Sorted by canonical key."""

from __future__ import annotations

from collections.abc import Mapping

ValueState = tuple[str, str | None]  # (status, value)


def delta_state(before: Mapping[str, ValueState], after: Mapping[str, ValueState]
                ) -> list[tuple[str, ValueState, ValueState]]:
    """Attributes whose (status, value) changed; missing keys are treated as ('ABSENT', None)."""
    absent: ValueState = ("ABSENT", None)
    keys = sorted(set(before) | set(after))
    out = []
    for k in keys:
        b = before.get(k, absent)
        a = after.get(k, absent)
        if b != a:
            out.append((k, b, a))
    return out


def delta_coupling(before: Mapping[str, str], after: Mapping[str, str]) -> list[tuple[str, str, str]]:
    """Relation keys whose coupling status changed; missing = 'ABSENT'."""
    keys = sorted(set(before) | set(after))
    out = []
    for k in keys:
        b = before.get(k, "ABSENT")
        a = after.get(k, "ABSENT")
        if b != a:
            out.append((k, b, a))
    return out
