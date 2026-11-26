"""Kleene-K3 rule evaluator. Space-agnostic: callers supply attribute lookups for Ω_A, Ω_O or Ω_R.

A lookup returns either a symbol or a Bottom carrying the reason for ⊥ (D-11). TRANSITION rules see
two lookups (CURRENT, NEXT); a pair is evaluated only if the rule is valid at both ticks (07.9).
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from ..contracts.common import ArtifactRef, RuleResult, StateSpace
from ..contracts.f02 import (And, Eq, EvalReason, GovernanceDefinition, Implies, In, Not, Or, Predicate,
                             Rule, RuleEvaluation, RuleEvaluationSet, RuleKind, RuleSummary, TimeIndex,
                             TransitionIn, predicate_attributes)
from ..core.logic3 import K3, k3_and, k3_implies, k3_not, k3_or


@dataclass(frozen=True)
class Bottom:
    reason: EvalReason


AttrLookup = Callable[[str], "str | Bottom"]


class _Ctx:
    def __init__(self, cur: AttrLookup, nxt: AttrLookup | None) -> None:
        self.cur = cur
        self.nxt = nxt
        self.reasons: list[EvalReason] = []

    def get(self, attr: str, at: TimeIndex | None) -> str | None:
        look = self.nxt if at is TimeIndex.NEXT else self.cur
        assert look is not None
        v = look(attr)
        if isinstance(v, Bottom):
            self.reasons.append(v.reason)
            return None
        return v


def _eval(p: Predicate, c: _Ctx) -> K3:
    if isinstance(p, Eq):
        v = c.get(p.attr, p.at)
        return None if v is None else v == p.value
    if isinstance(p, In):
        v = c.get(p.attr, p.at)
        return None if v is None else v in p.values
    if isinstance(p, TransitionIn):
        a = c.get(p.attr, TimeIndex.CURRENT)
        b = c.get(p.attr, TimeIndex.NEXT)
        if a is None or b is None:
            return None
        return any(pair.from_ == a and pair.to == b for pair in p.allowed)
    if isinstance(p, Not):
        return k3_not(_eval(p.arg, c))
    if isinstance(p, And):
        return k3_and([_eval(a, c) for a in p.args])
    if isinstance(p, Or):
        return k3_or([_eval(a, c) for a in p.args])
    if isinstance(p, Implies):
        return k3_implies(_eval(p.if_, c), _eval(p.then, c))
    raise TypeError(p)


_ORDER = (EvalReason.NOT_APPLICABLE_INPUT, EvalReason.UNDETERMINED_INPUT, EvalReason.UNKNOWN_INPUT)


def _to_result(v: K3) -> RuleResult:
    return RuleResult.UNEVALUABLE if v is None else (RuleResult.TRUE if v else RuleResult.FALSE)


def evaluate_rules(rules: tuple[Rule, ...], space: StateSpace, tick: int, cur: AttrLookup,
                   nxt: AttrLookup | None = None) -> tuple[tuple[RuleEvaluation, ...], int]:
    """Evaluate rules at tick (STATE/FUNCTION) and pair (tick, tick+1) (TRANSITION, if nxt given).

    Returns evaluations sorted by rule_id and the count of rules not in validity (K-07)."""
    by_id = {r.rule_id: r for r in rules}
    done: dict[str, RuleResult] = {}
    out: dict[str, RuleEvaluation] = {}
    not_valid = 0

    def run(r: Rule) -> RuleResult | None:
        nonlocal not_valid
        if r.rule_id in done:
            return done[r.rule_id]
        is_tr = r.kind is RuleKind.TRANSITION
        if is_tr and nxt is None:
            return None
        valid = r.valid_at(tick) and (not is_tr or r.valid_at(tick + 1))
        if not valid:
            not_valid += 1
            done[r.rule_id] = RuleResult.UNEVALUABLE
            return None
        req_ok = True
        for q in r.requires:
            qr = by_id.get(q)
            res = run(qr) if qr is not None else None
            if res is not RuleResult.TRUE:
                req_ok = False
        ctx = _Ctx(cur, nxt if is_tr else None)
        if not req_ok:
            result, reason = RuleResult.UNEVALUABLE, EvalReason.REQUIREMENT_NOT_MET
        else:
            result = _to_result(_eval(r.expression, ctx))
            reason = EvalReason.OK
            if result is RuleResult.UNEVALUABLE:
                reason = next((x for x in _ORDER if x in ctx.reasons), EvalReason.UNKNOWN_INPUT)
        done[r.rule_id] = result
        out[r.rule_id] = RuleEvaluation(
            rule_ref=r.rule_id, rule_version=r.version, space=space, tick=tick,
            tick_to=tick + 1 if is_tr else None, result=result, reason=reason,
            input_attribute_refs=tuple(sorted(set(predicate_attributes(r.expression)))))
        return result

    for r in sorted(rules, key=lambda x: x.rule_id):
        run(r)
    return tuple(out[k] for k in sorted(out)), not_valid


def summarize(evals: tuple[RuleEvaluation, ...], not_in_validity: int) -> RuleSummary:
    return RuleSummary(true=sum(e.result is RuleResult.TRUE for e in evals),
                       false=sum(e.result is RuleResult.FALSE for e in evals),
                       unevaluable=sum(e.result is RuleResult.UNEVALUABLE for e in evals),
                       not_in_validity=not_in_validity)


def evaluate_set(g: GovernanceDefinition, governance_ref: ArtifactRef, space: StateSpace, tick: int,
                 cur: AttrLookup, nxt: AttrLookup | None = None) -> RuleEvaluationSet:
    evals, niv = evaluate_rules(g.rules, space, tick, cur, nxt)
    return RuleEvaluationSet(governance_ref=governance_ref, space=space, tick=tick, evaluations=evals,
                             not_in_validity=niv, summary=summarize(evals, niv))
