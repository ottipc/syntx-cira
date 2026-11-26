"""Tick sets per metric (07.3, K-19)."""

from __future__ import annotations


def consecutive_pairs(available: list[int]) -> list[tuple[int, int]]:
    s = set(available)
    return [(t, t + 1) for t in sorted(s) if t + 1 in s]


def all_ticks(tick_count: int) -> list[int]:
    return list(range(tick_count))
