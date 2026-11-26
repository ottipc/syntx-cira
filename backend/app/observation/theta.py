"""θ validation and observable projections of topology and rules (K-21, S-07)."""

from __future__ import annotations

from ..contracts.f01 import ImmutableTopology
from ..contracts.f02 import GovernanceDefinition, predicate_attributes
from ..contracts.f04_public import (GoalProperty, ObservableRules, ObservableTopologyDefinition,
                                    TargetDefinition)
from ..contracts.f04_record import ObservationConfig
from ..core.errors import CiraError, ErrorCode
from ..topology.validate import attribute_domains

PROFILES = ("full", "compact")


def validate_config(cfg: ObservationConfig, topo: ImmutableTopology, gov: GovernanceDefinition) -> None:
    issues: list[tuple[str, str]] = []
    rule_issues: list[tuple[str, str]] = []
    nodes = {n.node_id: n for n in topo.definition.nodes}
    rels = {r.relation_id for r in topo.definition.relations}
    rules = {r.rule_id: r for r in gov.rules}
    vis = set(cfg.visible_nodes)
    vis_attrs = {a.attribute_id for n in topo.definition.nodes if n.node_id in vis for a in n.attributes}
    for n in cfg.visible_nodes:
        if n not in nodes:
            issues.append(("visible_nodes", f"unknown node {n}"))
    for r in cfg.visible_relations:
        if r not in rels:
            issues.append(("visible_relations", f"unknown relation {r}"))
        else:
            rel = next(x for x in topo.definition.relations if x.relation_id == r)
            if rel.source not in vis or rel.target not in vis:
                issues.append(("visible_relations", f"{r} connects an invisible node"))
    ids = [s.source_id for s in cfg.sources]
    if len(set(ids)) != len(ids):
        issues.append(("sources", "duplicate source_id"))
    for s in cfg.sources:
        if s.lag_ticks < 0:
            issues.append((f"sources[{s.source_id}]", "lag_ticks < 0"))
        for a in s.observes:
            if a not in vis_attrs:
                issues.append((f"sources[{s.source_id}].observes", f"{a} is not an attribute of a visible node (K-21)"))
    for r in cfg.visible_rules:
        if r not in rules:
            rule_issues.append(("visible_rules", f"unknown rule {r}"))
            continue
        for a in predicate_attributes(rules[r].expression):
            if a not in vis_attrs:
                rule_issues.append(("visible_rules", f"{r} references invisible attribute {a} (K-21)"))
        for q in rules[r].requires:
            if q not in cfg.visible_rules:
                rule_issues.append(("visible_rules", f"{r} requires invisible rule {q}"))
    if not cfg.serialization_profiles:
        issues.append(("serialization_profiles", "at least one profile"))
    for p in cfg.serialization_profiles:
        if p not in PROFILES:
            issues.append(("serialization_profiles", f"unknown profile {p}"))
    if cfg.bundle_budget.max_observations < 1 or cfg.bundle_budget.max_bytes < 1:
        issues.append(("bundle_budget", "budget values must be >= 1"))
    if rule_issues:
        raise CiraError(ErrorCode.INVALID_RULE, "; ".join(i for _, i in rule_issues), field="F04",
                        details=tuple(rule_issues))
    if issues:
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "; ".join(i for _, i in issues), field="F04", details=tuple(issues))


def observable_topology(cfg: ObservationConfig, topo: ImmutableTopology) -> ObservableTopologyDefinition:
    vis = set(cfg.visible_nodes)
    nodes = tuple(n for n in topo.definition.nodes if n.node_id in vis)
    used = {a.domain_ref for n in nodes for a in n.attributes}
    return ObservableTopologyDefinition(
        nodes=nodes, relations=tuple(r for r in topo.definition.relations if r.relation_id in set(cfg.visible_relations)),
        value_domains=tuple(d for d in topo.definition.value_domains if d.domain_id in used))


def observable_rules(cfg: ObservationConfig, gov: GovernanceDefinition) -> ObservableRules:
    vis = set(cfg.visible_rules)
    return ObservableRules(rules=tuple(r for r in gov.rules if r.rule_id in vis))


def validate_target(target: TargetDefinition, otopo: ObservableTopologyDefinition, orules: ObservableRules) -> None:
    """S-07 / TX06: a target is observation-based — every subject and rule lies in what θ makes observable."""
    issues: list[tuple[str, str]] = []
    nodes = {n.node_id for n in otopo.nodes}
    attrs = {a.attribute_id: a.domain_ref for n in otopo.nodes for a in n.attributes}
    doms = {d.domain_id: d.symbols for d in otopo.value_domains}
    rules = {r.rule_id: r for r in orules.rules}
    ids = [g.goal_id for g in target.goals]
    if len(set(ids)) != len(ids):
        issues.append(("goals", "duplicate goal_id"))
    if not target.goals:
        issues.append(("goals", "target without goals"))
    for g in target.goals:
        w = f"goals[{g.goal_id}]"
        if g.subject_ref not in nodes and g.subject_ref not in attrs and g.subject_ref not in rules:
            issues.append((w, f"subject {g.subject_ref} is not observable"))
        if g.property is GoalProperty.RULE_SATISFIED:
            if g.rule_ref is None or g.rule_ref not in rules:
                issues.append((w, f"rule {g.rule_ref} is not an observable rule"))
        elif g.property is GoalProperty.ATTRIBUTE_EQUALS:
            if g.subject_ref not in attrs:
                issues.append((w, "ATTRIBUTE_EQUALS needs an observable attribute as subject"))
            elif g.value is None or g.value not in doms[attrs[g.subject_ref]]:
                issues.append((w, f"value {g.value} not in the observable domain"))
        elif g.property is GoalProperty.GAP_CLOSED and g.value is not None:
            issues.append((w, "GAP_CLOSED takes no value"))
    if issues:
        raise CiraError(ErrorCode.SCHEMA_VIOLATION, "; ".join(i for _, i in issues), field="F04", details=tuple(issues))


def domains_of(topo: ImmutableTopology) -> dict[str, tuple[str, ...]]:
    return attribute_domains(topo.definition)
