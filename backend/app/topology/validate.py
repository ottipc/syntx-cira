"""Topology validation and sealing (T01, K-01). Pure functions; no clock, no randomness."""

from __future__ import annotations

from ..contracts.common import Applicability
from ..contracts.f01 import ImmutableTopology, TopologyDefinition
from ..core.errors import CiraError, ErrorCode


def _err(issues: list[tuple[str, str]]) -> CiraError:
    return CiraError(ErrorCode.INVALID_TOPOLOGY, "; ".join(i for _, i in issues), field="F01",
                     details=tuple(issues))


def validate_topology(t: TopologyDefinition) -> TopologyDefinition:
    issues: list[tuple[str, str]] = []
    types = [nt.type_id for nt in t.node_types]
    domains = {d.domain_id for d in t.value_domains}
    if len(set(types)) != len(types):
        issues.append(("node_types", "duplicate node type"))
    if len(domains) != len(t.value_domains):
        issues.append(("value_domains", "duplicate value domain"))
    node_ids = [n.node_id for n in t.nodes]
    if len(set(node_ids)) != len(node_ids):
        issues.append(("nodes", "duplicate node_id"))
    if not t.nodes:
        issues.append(("nodes", "topology without nodes"))
    for i, n in enumerate(t.nodes):
        if not n.node_id.startswith("node:"):
            issues.append((f"nodes[{i}].node_id", f"{n.node_id} must start with node:"))
        if n.node_type not in types:
            issues.append((f"nodes[{i}].node_type", f"unknown node type {n.node_type}"))
        names = [a.name for a in n.attributes]
        if len(set(names)) != len(names):
            issues.append((f"nodes[{i}].attributes", "duplicate attribute name"))
        for j, a in enumerate(n.attributes):
            if a.domain_ref not in domains:
                issues.append((f"nodes[{i}].attributes[{j}].domain_ref", f"unknown domain {a.domain_ref}"))
    known = set(node_ids)
    rel_ids = [r.relation_id for r in t.relations]
    if len(set(rel_ids)) != len(rel_ids):
        issues.append(("relations", "duplicate relation_id"))
    for i, r in enumerate(t.relations):
        for end in ("source", "target"):
            ref = getattr(r, end)
            if ref not in known:
                issues.append((f"relations[{i}].{end}", f"unresolved reference {ref}"))
        if r.source == r.target:
            issues.append((f"relations[{i}]", "self relation"))
    if issues:
        raise _err(issues)
    return t


def seal(t: TopologyDefinition) -> ImmutableTopology:
    validate_topology(t)
    universe = tuple(sorted(a.attribute_id for n in t.nodes for a in n.attributes))
    return ImmutableTopology(definition=t, attribute_universe=universe)


def attribute_domains(t: TopologyDefinition) -> dict[str, tuple[str, ...]]:
    dom = {d.domain_id: d.symbols for d in t.value_domains}
    return {a.attribute_id: dom[a.domain_ref] for n in t.nodes for a in n.attributes}


def declared_applicability(t: TopologyDefinition) -> dict[str, Applicability]:
    return {a.attribute_id: a.applicability for n in t.nodes for a in n.attributes}
