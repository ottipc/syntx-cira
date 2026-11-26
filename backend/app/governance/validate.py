"""Governance validation (INVALID_RULE / INVALID_TRANSITION) against a sealed topology."""

from __future__ import annotations

from ..contracts.f01 import TopologyDefinition
from ..contracts.f02 import (And, Eq, GovernanceDefinition, Implies, In, Not, Or, Predicate, RuleKind,
                             TransitionIn)
from ..core.errors import CiraError, ErrorCode
from ..topology.validate import attribute_domains


def _walk(p: Predicate, doms: dict[str, tuple[str, ...]], where: str, issues: list[tuple[str, str]],
          trans: list[tuple[str, str]]) -> None:
    if isinstance(p, Eq):
        if p.attr not in doms:
            issues.append((where, f"unknown attribute {p.attr}"))
        elif p.value not in doms[p.attr]:
            issues.append((where, f"{p.value} not in domain of {p.attr}"))
    elif isinstance(p, In):
        if p.attr not in doms:
            issues.append((where, f"unknown attribute {p.attr}"))
        else:
            for v in p.values:
                if v not in doms[p.attr]:
                    issues.append((where, f"{v} not in domain of {p.attr}"))
    elif isinstance(p, TransitionIn):
        if p.attr not in doms:
            issues.append((where, f"unknown attribute {p.attr}"))
        else:
            for pair in p.allowed:
                if pair.from_ not in doms[p.attr] or pair.to not in doms[p.attr]:
                    trans.append((where, f"pair {pair.from_}->{pair.to} outside domain of {p.attr}"))
    elif isinstance(p, Not):
        _walk(p.arg, doms, where, issues, trans)
    elif isinstance(p, (And, Or)):
        for a in p.args:
            _walk(a, doms, where, issues, trans)
    elif isinstance(p, Implies):
        _walk(p.if_, doms, where, issues, trans)
        _walk(p.then, doms, where, issues, trans)


def validate_governance(g: GovernanceDefinition, topology: TopologyDefinition) -> GovernanceDefinition:
    issues: list[tuple[str, str]] = []
    trans: list[tuple[str, str]] = []
    doms = attribute_domains(topology)
    nodes = {n.node_id for n in topology.nodes}
    roles = {r.role_id for r in g.roles}
    ids = [r.rule_id for r in g.rules]
    if len(set(ids)) != len(ids):
        issues.append(("rules", "duplicate rule_id"))
    known = set(ids)
    for i, r in enumerate(g.rules):
        w = f"rules[{i}]"
        _walk(r.expression, doms, f"{w}.expression", issues, trans)
        for n in r.applies_to:
            if n not in nodes:
                issues.append((f"{w}.applies_to", f"unknown node {n}"))
        for s in r.scope:
            if s not in nodes and s not in doms:
                issues.append((f"{w}.scope", f"unknown scope subject {s}"))
        for q in r.requires:
            if q not in known:
                issues.append((f"{w}.requires", f"unknown rule {q}"))
        for p in r.permits:
            if p not in roles:
                issues.append((f"{w}.permits", f"unknown role {p}"))
    # requires must be acyclic
    graph = {r.rule_id: r.requires for r in g.rules}
    state: dict[str, int] = {}

    def visit(x: str) -> bool:
        if state.get(x) == 1:
            return False
        if state.get(x) == 2:
            return True
        state[x] = 1
        ok = all(visit(y) for y in graph.get(x, ()) if y in graph)
        state[x] = 2
        return ok

    for rid in graph:
        if not visit(rid):
            issues.append(("rules.requires", f"cyclic requirement through {rid}"))
            break
    if issues:
        raise CiraError(ErrorCode.INVALID_RULE, "; ".join(i for _, i in issues), field="F02",
                        details=tuple(issues))
    if trans:
        raise CiraError(ErrorCode.INVALID_TRANSITION, "; ".join(i for _, i in trans), field="F02",
                        details=tuple(trans))
    return g
