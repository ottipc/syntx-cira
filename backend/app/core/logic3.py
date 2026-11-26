"""Kleene strong three-valued logic K3 (Kap. 07.9, D-11). Values: True, False, None (⊥)."""

from __future__ import annotations

from collections.abc import Iterable

K3 = bool | None


def k3_not(a: K3) -> K3:
    return None if a is None else (not a)


def k3_and(values: Iterable[K3]) -> K3:
    vals = list(values)
    if any(v is False for v in vals):
        return False
    if any(v is None for v in vals):
        return None
    return True


def k3_or(values: Iterable[K3]) -> K3:
    vals = list(values)
    if any(v is True for v in vals):
        return True
    if any(v is None for v in vals):
        return None
    return False


def k3_implies(a: K3, b: K3) -> K3:
    return k3_or([k3_not(a), b])
