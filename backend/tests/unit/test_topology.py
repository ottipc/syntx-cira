"""T01 — valid topology; invalid references rejected (K-01, REQ-010–013)."""

from __future__ import annotations

import json
from typing import Any

import pytest
from pydantic import ValidationError

from app.contracts.f01 import TopologyDefinition
from app.core.errors import CiraError, ErrorCode
from app.topology import seal, validate_topology
from tests.conftest import load_json

pytestmark = [pytest.mark.tid("T01"), pytest.mark.req("REQ-010"), pytest.mark.req("REQ-011"),
              pytest.mark.req("REQ-012"), pytest.mark.req("REQ-013")]


def topo(mut: Any = None) -> dict[str, Any]:
    d: dict[str, Any] = load_json("f01_topology/fx_04_11.json")
    if mut:
        mut(d)
    return d


def parse(d: dict[str, Any]) -> TopologyDefinition:
    return TopologyDefinition.model_validate_json(json.dumps(d))


def test_fixture_topology_valid_and_sealed() -> None:
    t = validate_topology(parse(topo()))
    s = seal(t)
    assert len(s.attribute_universe) == 10
    assert list(s.attribute_universe) == sorted(s.attribute_universe)
    assert s.definition == t


def test_seal_is_content_stable() -> None:
    from app.core.hashing import artifact_id
    a = seal(parse(topo())).model_dump(mode="json")
    b = seal(parse(topo())).model_dump(mode="json")
    assert artifact_id("immutable_topology", a) == artifact_id("immutable_topology", b)


@pytest.mark.parametrize("mut,needle", [
    (lambda d: d["relations"].append({"relation_id": "rel:depends_on:n01:n99", "relation_type": "depends_on",
                                      "source": "node:n01", "target": "node:n99", "version": "1.0.0"}), "node:n99"),
    (lambda d: d["nodes"][0].update(node_type="type:ghost"), "type:ghost"),
    (lambda d: d["nodes"][0]["attributes"][0].update(domain_ref="dom:ghost"), "dom:ghost"),
    (lambda d: d["nodes"].append(dict(d["nodes"][0])), "duplicate node_id"),
    (lambda d: d["relations"].append(dict(d["relations"][0])), "duplicate relation_id"),
    (lambda d: d["relations"].append({"relation_id": "rel:depends_on:n01:n01", "relation_type": "depends_on",
                                      "source": "node:n01", "target": "node:n01", "version": "1.0.0"}), "self relation"),
])
def test_invalid_references_rejected(mut: Any, needle: str) -> None:
    with pytest.raises(CiraError) as e:
        validate_topology(parse(topo(mut)))
    assert e.value.code is ErrorCode.INVALID_TOPOLOGY
    assert needle in e.value.message
    assert e.value.details


@pytest.mark.parametrize("mut", [
    lambda d: d["relations"][0].update(relation_id="rel:depends_on:x:y"),
    lambda d: d["nodes"][0]["attributes"][0].update(attribute_id="attr:n02/state"),
    lambda d: d["relations"][0].update(relation_type="feeds"),
    lambda d: d["nodes"][0].update(node_id="Node:N01"),
    lambda d: d["value_domains"][0].update(symbols=["NOMINAL", "NOMINAL"]),
    lambda d: d.update(extra_field=1),
])
def test_schema_level_id_rules(mut: Any) -> None:
    with pytest.raises(ValidationError):
        parse(topo(mut))


def test_contract_is_immutable() -> None:
    t = parse(topo())
    with pytest.raises(ValidationError):
        t.version = "2.0.0"  # type: ignore[misc]
