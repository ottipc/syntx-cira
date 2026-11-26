"""M09 — GAP Closure state_rules_A_final_tick/v1: #resolved / #original (S-05, K-43)."""

from __future__ import annotations

from fractions import Fraction

from .views import ClosureView, NumDen

def closure_sets(c: ClosureView) -> dict[str, list[str]]:
    base = dict(c.baseline)
    rec = dict(c.recovery)
    original = sorted(k for k, r in base.items() if r == "FALSE")
    return {
        "original": original,
        "resolved": [k for k in original if rec.get(k) == "TRUE"],
        "persisting": [k for k in original if rec.get(k) == "FALSE"],
        "unevaluable_in_recovery": [k for k in original if rec.get(k, "UNEVALUABLE") == "UNEVALUABLE"],
        "new": sorted(k for k, r in rec.items() if r == "FALSE" and k not in original),
    }


def m09(c: ClosureView) -> NumDen:
    s = closure_sets(c)
    return NumDen(Fraction(len(s["resolved"])), Fraction(len(s["original"])),
                  {"persisting": len(s["persisting"]), "new_inconsistencies": len(s["new"]),
                   "unevaluable_in_recovery": len(s["unevaluable_in_recovery"])})
