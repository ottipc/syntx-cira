"""Exact rational arithmetic (P05, X-04). Float only as derived representation."""

from __future__ import annotations

from fractions import Fraction


def as_fraction(n: int, d: int) -> Fraction:
    if d < 1:
        raise ValueError("denominator must be >= 1")
    if n < 0:
        raise ValueError("numerator must be >= 0")
    return Fraction(n, d)


def to_pair(value: Fraction) -> tuple[int, int]:
    """Reduced (n, d) pair; Fraction is always reduced."""
    if value < 0:
        raise ValueError("negative rational not allowed in contracts")
    return value.numerator, value.denominator


def ratio(numerator: Fraction, denominator: Fraction) -> Fraction | None:
    """n/d, or None for a zero denominator (UNDEFINED, REQ-042)."""
    if denominator == 0:
        return None
    return numerator / denominator
