"""TX07 — K3 truth tables, requires, validity, `at` (07.9, K-06, K-07, D-11, D-12)."""

from __future__ import annotations

import itertools
import json
from typing import Any

import pytest
from pydantic import ValidationError

from app.contracts.common import RuleResult, StateSpace
from app.contracts.f01 import TopologyDefinition
from app.contracts.f02 import EvalReason, GovernanceDefinition, Rule
from app.core.errors import CiraError, ErrorCode
from app.core.logic3 import k3_and, k3_implies, k3_not, k3_or
from app.governance import Bottom, evaluate_rules, evaluate_set, validate_governance
from tests.conftest import load_json

pytestmark = [pytest.mark.tid("TX07"), pytest.mark.req("REQ-014"), pytest.mark.req("REQ-017"),
              pytest.mark.req("REQ-025")]
V = [True, False, None]
TOPO = TopologyDefinition.model_validate_json(json.dumps(load_json("f01_topology/fx_04_11.json")))
TREF = {"artifact_id": "art:" + "0" * 32, "artifact_type": "topology_definition", "content_hash": "sha256:" + "0" * 64}


def test_truth_tables() -> None:
    assert [k3_not(a) for a in V] == [False, True, None]
    table_and = {(True, True): True, (True, False): False, (True, None): None, (False, None): False,
                 (None, None): None, (False, False): False}
    table_or = {(True, True): True, (True, False): True, (True, None): True, (False, None): None,
                (None, None): None, (False, False): False}
    for (a, b), r in table_and.items():
        assert k3_and([a, b]) == r and k3_and([b, a]) == r
    for (a, b), r in table_or.items():
        assert k3_or([a, b]) == r and k3_or([b, a]) == r
    for a, b in itertools.product(V, V):
        assert k3_implies(a, b) == k3_or([k3_not(a), b])
    assert k3_implies(False, None) is True and k3_implies(None, True) is True and k3_implies(True, None) is None


def rule(**kw: Any) -> dict[str, Any]:
    return {"version": "1.0.0", "kind": "STATE", **kw}


def gov(rules: list[dict[str, Any]]) -> GovernanceDefinition:
    return GovernanceDefinition.model_validate_json(json.dumps({
        "governance_id": "gov:t", "version": "1.0.0", "topology_ref": TREF,
        "roles": [{"role_id": "role:op", "label": "Op"}], "rules": rules}))


def eq(a: str, v: str, at: str | None = None) -> dict[str, Any]:
    d = {"op": "eq", "attr": a, "value": v}
    if at:
        d["at"] = at
    return d


def look(values: dict[str, str | Bottom]) -> Any:
    return lambda a: values.get(a, Bottom(EvalReason.UNKNOWN_INPUT))


def test_bottom_sources_and_reasons() -> None:
    g = gov([rule(rule_id="rule:a", expression=eq("attr:n01/state", "NOMINAL")),
             rule(rule_id="rule:b", expression=eq("attr:n02/state", "NOMINAL")),
             rule(rule_id="rule:c", expression=eq("attr:n03/state", "NOMINAL"))])
    evals, _ = evaluate_rules(g.rules, StateSpace.R, 0, look({
        "attr:n01/state": Bottom(EvalReason.UNDETERMINED_INPUT),
        "attr:n02/state": Bottom(EvalReason.NOT_APPLICABLE_INPUT)}))
    r = {e.rule_ref: (e.result, e.reason) for e in evals}
    assert r["rule:a"] == (RuleResult.UNEVALUABLE, EvalReason.UNDETERMINED_INPUT)
    assert r["rule:b"] == (RuleResult.UNEVALUABLE, EvalReason.NOT_APPLICABLE_INPUT)
    assert r["rule:c"] == (RuleResult.UNEVALUABLE, EvalReason.UNKNOWN_INPUT)


def test_short_circuit_semantics_not_lazy_but_k3() -> None:
    g = gov([rule(rule_id="rule:a", expression={"op": "or", "args": [eq("attr:n01/state", "NOMINAL"),
                                                                     eq("attr:n02/state", "NOMINAL")]}),
             rule(rule_id="rule:b", expression={"op": "and", "args": [eq("attr:n01/state", "FAULTY"),
                                                                      eq("attr:n02/state", "NOMINAL")]})])
    evals, _ = evaluate_rules(g.rules, StateSpace.O, 0, look({"attr:n01/state": "NOMINAL"}))
    assert [e.result for e in evals] == [RuleResult.TRUE, RuleResult.FALSE]


def test_requires_not_met_gives_bottom() -> None:
    g = gov([rule(rule_id="rule:base", expression=eq("attr:n01/state", "NOMINAL")),
             rule(rule_id="rule:dep", requires=["rule:base"], expression=eq("attr:n02/state", "NOMINAL"))])
    evals, _ = evaluate_rules(g.rules, StateSpace.A, 0, look({"attr:n01/state": "FAULTY", "attr:n02/state": "NOMINAL"}))
    r = {e.rule_ref: e for e in evals}
    assert r["rule:dep"].result is RuleResult.UNEVALUABLE
    assert r["rule:dep"].reason is EvalReason.REQUIREMENT_NOT_MET
    evals, _ = evaluate_rules(g.rules, StateSpace.A, 0, look({"attr:n01/state": "NOMINAL", "attr:n02/state": "NOMINAL"}))
    assert {e.rule_ref: e.result for e in evals}["rule:dep"] is RuleResult.TRUE


def test_validity_inclusive_and_pairs_both_valid() -> None:
    g = gov([rule(rule_id="rule:w", valid_from_tick=1, valid_until_tick=2, expression=eq("attr:n01/state", "NOMINAL")),
             {"rule_id": "rule:t", "version": "1.0.0", "kind": "TRANSITION", "valid_from_tick": 0, "valid_until_tick": 1,
              "expression": {"op": "transition_in", "attr": "attr:n04/state",
                             "allowed": [{"from": "ACTIVE", "to": "STANDBY"}]}}])
    lv = look({"attr:n01/state": "NOMINAL", "attr:n04/state": "ACTIVE"})
    nx = look({"attr:n04/state": "STANDBY"})
    counts = {}
    for t in range(4):
        s = evaluate_set(g, __import__("app.contracts.common", fromlist=["ArtifactRef"]).ArtifactRef.model_validate(TREF),
                         StateSpace.A, t, lv, nx)
        counts[t] = ({e.rule_ref for e in s.evaluations}, s.not_in_validity, s.summary)
    assert counts[0][0] == {"rule:t"} and counts[0][1] == 1
    assert counts[1][0] == {"rule:w"} and counts[1][1] == 1  # pair (1,2) invalid at 2
    assert counts[2][0] == {"rule:w"}
    assert counts[3][0] == set() and counts[3][1] == 2
    s0 = counts[0][2]
    assert (s0.true, s0.false, s0.unevaluable, s0.not_in_validity) == (1, 0, 0, 1)


def test_transition_at_current_next() -> None:
    g = gov([{"rule_id": "rule:t", "version": "1.0.0", "kind": "TRANSITION",
              "expression": {"op": "implies", "if": eq("attr:n05/state", "OPEN", "CURRENT"),
                             "then": eq("attr:n05/state", "CLOSED", "NEXT")}}])
    cur, nxt = look({"attr:n05/state": "OPEN"}), look({"attr:n05/state": "OPEN"})
    evals, _ = evaluate_rules(g.rules, StateSpace.A, 3, cur, nxt)
    assert evals[0].result is RuleResult.FALSE and evals[0].tick_to == 4
    evals, _ = evaluate_rules(g.rules, StateSpace.A, 3, cur, None)
    assert evals == ()


@pytest.mark.parametrize("bad", [
    rule(rule_id="rule:x", expression=eq("attr:n01/state", "NOMINAL", "NEXT")),
    {"rule_id": "rule:x", "version": "1.0.0", "kind": "TRANSITION", "expression": eq("attr:n01/state", "NOMINAL")},
    rule(rule_id="rule:x", expression={"op": "transition_in", "attr": "attr:n01/state",
                                       "allowed": [{"from": "NOMINAL", "to": "FAULTY"}]}),
    rule(rule_id="rule:x", valid_from_tick=3, valid_until_tick=2, expression=eq("attr:n01/state", "NOMINAL")),
])
def test_at_and_validity_schema(bad: dict[str, Any]) -> None:
    with pytest.raises(ValidationError):
        Rule.model_validate_json(json.dumps(bad))


@pytest.mark.parametrize("rules,code", [
    ([rule(rule_id="rule:x", expression=eq("attr:n99/state", "NOMINAL"))], ErrorCode.INVALID_RULE),
    ([rule(rule_id="rule:x", expression=eq("attr:n01/state", "OPEN"))], ErrorCode.INVALID_RULE),
    ([rule(rule_id="rule:x", applies_to=["node:n99"], expression=eq("attr:n01/state", "NOMINAL"))], ErrorCode.INVALID_RULE),
    ([rule(rule_id="rule:x", requires=["rule:y"], expression=eq("attr:n01/state", "NOMINAL")),
      rule(rule_id="rule:y", requires=["rule:x"], expression=eq("attr:n01/state", "NOMINAL"))], ErrorCode.INVALID_RULE),
    ([rule(rule_id="rule:x", permits=["role:ghost"], expression=eq("attr:n01/state", "NOMINAL"))], ErrorCode.INVALID_RULE),
    ([rule(rule_id="rule:x", expression=eq("attr:n01/state", "NOMINAL")),
      rule(rule_id="rule:x", expression=eq("attr:n01/state", "NOMINAL"))], ErrorCode.INVALID_RULE),
    ([{"rule_id": "rule:x", "version": "1.0.0", "kind": "TRANSITION",
       "expression": {"op": "transition_in", "attr": "attr:n05/state", "allowed": [{"from": "OPEN", "to": "AJAR"}]}}],
     ErrorCode.INVALID_TRANSITION),
])
def test_governance_validation(rules: list[dict[str, Any]], code: ErrorCode) -> None:
    with pytest.raises(CiraError) as e:
        validate_governance(gov(rules), TOPO)
    assert e.value.code is code
