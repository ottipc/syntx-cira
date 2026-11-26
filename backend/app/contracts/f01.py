"""contracts.f01 — F01_DOMAIN_TOPOLOGY (Kap. 08.2)."""

from __future__ import annotations

from enum import Enum

from pydantic import model_validator

from .common import Applicability, ArtifactRef, Frozen, LocalName, SemVer, StableId, Symbol, Text


class RelationType(str, Enum):
    depends_on = "depends_on"
    reports_to = "reports_to"
    provides = "provides"


class ValueDomain(Frozen):
    domain_id: StableId
    version: SemVer
    symbols: tuple[Symbol, ...]

    @model_validator(mode="after")
    def _unique(self) -> "ValueDomain":
        if not self.symbols or len(set(self.symbols)) != len(self.symbols):
            raise ValueError("domain symbols must be non-empty and unique")
        return self


class NodeTypeDecl(Frozen):
    type_id: StableId
    label: Text


class AttributeDecl(Frozen):
    attribute_id: StableId
    name: LocalName
    domain_ref: StableId
    applicability: Applicability


class Node(Frozen):
    node_id: StableId
    node_type: StableId
    version: SemVer
    label: Text
    attributes: tuple[AttributeDecl, ...]

    @model_validator(mode="after")
    def _attr_prefix(self) -> "Node":
        local = self.node_id.split(":", 1)[1]
        for a in self.attributes:
            if a.attribute_id != f"attr:{local}/{a.name}":
                raise ValueError(f"attribute_id {a.attribute_id} must be attr:{local}/{a.name}")
        return self


class Relation(Frozen):
    relation_id: StableId
    relation_type: RelationType
    source: StableId
    target: StableId
    version: SemVer

    @model_validator(mode="after")
    def _canonical(self) -> "Relation":
        s = self.source.split(":", 1)[1]
        t = self.target.split(":", 1)[1]
        expected = f"rel:{self.relation_type.value}:{s}:{t}"
        if self.relation_id != expected:
            raise ValueError(f"relation_id must be {expected} (K-01)")
        return self


class TopologyDefinition(Frozen):
    topology_id: StableId
    version: SemVer
    node_types: tuple[NodeTypeDecl, ...]
    value_domains: tuple[ValueDomain, ...]
    nodes: tuple[Node, ...]
    relations: tuple[Relation, ...]


class ImmutableTopology(Frozen):
    definition: TopologyDefinition
    attribute_universe: tuple[StableId, ...]


class NodeView(Frozen):
    node_id: StableId
    node_type: StableId
    label: Text
    attributes: tuple[StableId, ...]


class RelationView(Frozen):
    relation_id: StableId
    relation_type: RelationType
    source: StableId
    target: StableId


class TopologyProjectionBody(Frozen):
    topology_ref: ArtifactRef
    nodes: tuple[NodeView, ...]
    relations: tuple[RelationView, ...]
