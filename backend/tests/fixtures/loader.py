"""Golden fixture JSON → view types (shared by kernel and oracle runs)."""

from __future__ import annotations

from fractions import Fraction
from typing import Any

from app.metrics.matching import normalize
from app.metrics.views import (AttrState, CaseView, ClosureView, FunctionSeries, GapView, RuleTickView,
                               StabilityView, TickView, Weights)


def frac(s: str) -> Fraction:
    return Fraction(s)


def weights(d: dict[str, Any] | None) -> Weights:
    if not d:
        return Weights()
    return Weights(default=frac(d["default"]),
                   explicit=tuple(sorted((k, frac(v)) for k, v in d.get("explicit", {}).items())))


def tick_view(t: dict[str, Any]) -> TickView:
    return TickView(tick=t["tick"], sweep_tick=t.get("sweep_tick", True),
                    attrs=tuple(AttrState(**a) for a in t["attrs"]))


def rule_tick(d: dict[str, Any]) -> RuleTickView:
    return RuleTickView(tick=d["tick"], results=tuple((r, v) for r, v in d["results"]),
                        not_in_validity=d.get("not_in_validity", 0))


def series(d: dict[str, Any]) -> FunctionSeries:
    return FunctionSeries(function_ref=d["function_ref"], values=tuple((t, v) for t, v in d["values"]))


def cases(lst: list[dict[str, Any]], ra: dict[str, list[str]]) -> tuple[CaseView, ...]:
    rmap = {k: tuple(v) for k, v in ra.items()}
    return tuple(CaseView(case_id=c["case_id"], nodes=normalize(tuple(c["subject_refs"]), rmap),
                          tick_from=c["tick_from"], tick_to=c.get("tick_to")) for c in lst)


def gaps(lst: list[dict[str, Any]], ra: dict[str, list[str]]) -> tuple[GapView, ...]:
    rmap = {k: tuple(v) for k, v in ra.items()}
    return tuple(GapView(gap_id=g["gap_id"], tick=g["tick"], nodes=normalize(tuple(g["subject_refs"]), rmap))
                 for g in lst)


def closure(b: list[list[str]], r: list[list[str]]) -> ClosureView:
    return ClosureView(baseline=tuple((k, v) for k, v in b), recovery=tuple((k, v) for k, v in r))


def stability(ref: list[str], r1: list[list[str]], r2: list[list[str]]) -> StabilityView:
    return StabilityView(reference=tuple(ref), r1=tuple((a, v) for a, v in r1), r2=tuple((a, v) for a, v in r2))
