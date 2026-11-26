"""F03 emulator: determinism, transition semantics, K-66 REJECTED, INVALID_TRANSITION (REQ-016, REQ-018–REQ-022)."""

from __future__ import annotations

import json
from typing import Any

import pytest

from app.contracts.common import load
from app.contracts.f03 import EventStatus, ScenarioDefinition
from app.core.errors import CiraError, ErrorCode
from app.emulator import actual_values, run_scenario
from app.experiments import catalog
from app.topology import seal

pytestmark = [pytest.mark.tid("T03")]
TOPO = seal(catalog.get("topology_definition", "topo:fx_04_11"))  # type: ignore[arg-type]
GOV = catalog.get("governance_definition", "gov:fx")


def scn(sid: str = "scn:fx_base", **upd: Any) -> ScenarioDefinition:
    s = catalog.get("scenario_definition", sid)
    d = s.model_dump(mode="json")
    d.update(upd)
    return load(ScenarioDefinition, d)


@pytest.mark.req("REQ-018")
@pytest.mark.req("REQ-019")
@pytest.mark.req("REQ-021")
def test_baseline_progression_and_determinism() -> None:
    a = run_scenario(scn(), TOPO, GOV)  # type: ignore[arg-type]
    b = run_scenario(scn(), TOPO, GOV)  # type: ignore[arg-type]
    assert a == b
    assert [s.tick for s in a.states] == list(range(6))
    v = [actual_values(s) for s in a.states]
    assert v[1]["attr:n05/state"].value == "CLOSED" and v[2]["attr:n05/state"].value == "OPEN"  # u_t acts on t+1
    assert v[2]["attr:n09/state"].value == "PENDING"
    assert v[4]["attr:n03/state"].value == "FAULTY" and v[5]["attr:n08/state"].value == "DEGRADED"
    assert [s.last_seq for s in a.states] == [None, None, 1, 2, 3, 4]
    assert [e.seq for e in a.events] == [0, 1, 2, 3, 4]


@pytest.mark.req("REQ-016")
def test_approval_without_permit_is_rejected_k66() -> None:
    em = run_scenario(scn(), TOPO, GOV)  # type: ignore[arg-type]
    rej = [e for e in em.events if e.status is EventStatus.REJECTED]
    assert len(rej) == 1 and rej[0].event_ref == "evt:b3" and rej[0].effects == ()
    assert rej[0].error is not None and "permit" in rej[0].error.message
    assert actual_values(em.states[3])["attr:n09/state"].value == "PENDING"


@pytest.mark.req("REQ-016")
def test_permitted_approval_becomes_state() -> None:
    em = run_scenario(scn("scn:fx_rec"), TOPO, GOV)  # type: ignore[arg-type]
    assert all(e.status is EventStatus.APPLIED for e in em.events)
    assert actual_values(em.states[3])["attr:n09/state"].value == "AUTHORIZED"


def _bad_input(**ev: Any) -> list[dict[str, Any]]:
    return [{"event_id": "evt:x", "tick": 1, "seq": 0, "kind": "SET_ATTRIBUTE", **ev}]


@pytest.mark.req("REQ-022")
@pytest.mark.parametrize("inputs", [
    _bad_input(attribute_ref="attr:n99/state", value="NOMINAL"),
    _bad_input(attribute_ref="attr:n05/state", value="NOMINAL"),
    _bad_input(attribute_ref="attr:n05/state", value="OPEN", tick=5),
    [{"event_id": "evt:a", "tick": 1, "seq": 1, "kind": "SET_ATTRIBUTE", "attribute_ref": "attr:n05/state", "value": "OPEN"},
     {"event_id": "evt:b", "tick": 1, "seq": 1, "kind": "SET_ATTRIBUTE", "attribute_ref": "attr:n05/state", "value": "OPEN"}],
    [{"event_id": "evt:a", "tick": 2, "seq": 0, "kind": "SET_ATTRIBUTE", "attribute_ref": "attr:n05/state", "value": "OPEN"},
     {"event_id": "evt:b", "tick": 1, "seq": 1, "kind": "SET_ATTRIBUTE", "attribute_ref": "attr:n05/state", "value": "OPEN"}],
])
def test_structural_invalidity_raises(inputs: list[dict[str, Any]]) -> None:
    with pytest.raises(CiraError) as e:
        run_scenario(scn(inputs=inputs), TOPO, GOV)  # type: ignore[arg-type]
    assert e.value.code is ErrorCode.INVALID_TRANSITION


@pytest.mark.req("REQ-022")
def test_setting_not_applicable_attribute_is_invalid() -> None:
    topo = seal(catalog.get("topology_definition", "topo:fx_04_11_na"))  # type: ignore[arg-type]
    gov = json.loads(GOV.model_dump_json())
    from app.contracts.common import make_ref
    from app.contracts.f02 import GovernanceDefinition
    gov["topology_ref"] = make_ref("topology_definition", topo.definition).model_dump(mode="json")
    g = load(GovernanceDefinition, gov)
    init = [dict(v, applicability="NOT_APPLICABLE", value=None) if v["attribute_ref"] == "attr:n10/state" else v
            for v in scn().model_dump(mode="json")["initial_state"]]
    s = scn(initial_state=init, topology_ref=make_ref("topology_definition", topo.definition).model_dump(mode="json"),
            governance_ref=make_ref("governance_definition", g).model_dump(mode="json"),
            inputs=_bad_input(attribute_ref="attr:n10/state", value="NOMINAL"))
    with pytest.raises(CiraError) as e:
        run_scenario(s, topo, g)
    assert "NOT_APPLICABLE" in e.value.message
    ok = run_scenario(scn(initial_state=init, topology_ref=s.topology_ref.model_dump(mode="json"),
                          governance_ref=s.governance_ref.model_dump(mode="json"), inputs=[]), topo, g)
    assert all(actual_values(x)["attr:n10/state"].value is None for x in ok.states)


@pytest.mark.req("REQ-020")
def test_baseline_recovery_pair_is_comparable() -> None:
    b, r = scn(), scn("scn:fx_rec")
    from app.contracts.common import make_ref
    assert b.fixture_lineage_id == r.fixture_lineage_id
    assert b.topology_ref == r.topology_ref and b.governance_ref == r.governance_ref
    assert r.variant_of == make_ref("scenario_definition", b) and b.tick_count == r.tick_count == 6
