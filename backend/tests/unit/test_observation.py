"""F04 observation: generation, ω, staleness, profiles, budget, CONTEXT_INCOMPLETE, θ (REQ-024–REQ-027, K-09, K-12)."""

from __future__ import annotations

import json
from typing import Any

import pytest

from app.contracts.common import ObservationStatus, load
from app.contracts.f04_record import ObservationConfig
from app.core.errors import CiraError, ErrorCode
from app.emulator import run_scenario
from app.experiments import catalog
from app.observation import observe, omega, serialize, validate_config
from app.topology import seal
from app.topology.validate import declared_applicability

pytestmark = [pytest.mark.tid("T06")]
TOPO = seal(catalog.get("topology_definition", "topo:fx_04_11"))  # type: ignore[arg-type]
GOV = catalog.get("governance_definition", "gov:fx")
STATES = run_scenario(catalog.get("scenario_definition", "scn:fx_base"), TOPO, GOV).states  # type: ignore[arg-type]
DECL = declared_applicability(TOPO.definition)


def cfg(cid: str = "ocfg:fx_partial", **upd: Any) -> ObservationConfig:
    d = json.loads(catalog.get("observation_config", cid).model_dump_json())
    d.update(upd)
    return load(ObservationConfig, d)


@pytest.mark.req("REQ-024")
@pytest.mark.req("REQ-025")
def test_generation_rules_and_omega() -> None:
    run = observe(cfg(), TOPO, GOV, STATES)  # type: ignore[arg-type]
    ctx0 = run.ticks[0].context
    by = {o.observation_id: o for o in ctx0.observations}
    assert by["obs:s01:n01/state:t0"].status is ObservationStatus.KNOWN and by["obs:s01:n01/state:t0"].value == "NOMINAL"
    assert by["obs:none:n07/state:t0"].status is ObservationStatus.UNKNOWN  # s02 lag 1: nothing at t0
    assert not any("n10" in k for k in by)  # invisible nodes produce no observations
    assert by["obs:none:n08/state:t0"].status is ObservationStatus.UNKNOWN  # visible, no source
    w = omega(ctx0, TOPO.attribute_universe, DECL)
    assert [w[a].status.value for a in TOPO.attribute_universe] == ["KNOWN"] * 6 + ["UNKNOWN"] * 4
    ctx1 = run.ticks[1].context
    w1 = omega(ctx1, TOPO.attribute_universe, DECL)
    assert w1["attr:n07/state"].status is ObservationStatus.KNOWN and w1["attr:n07/state"].stale
    assert w1["attr:n07/state"].observed_at_tick == 0
    w3 = omega(run.ticks[3].context, TOPO.attribute_universe, DECL)
    assert w3["attr:n07/state"].status is ObservationStatus.UNKNOWN  # s02 inactive at 3
    assert run.ticks[1].state_ticks == (0, 1)


@pytest.mark.req("REQ-025")
def test_unknown_is_neither_false_nor_absent() -> None:
    run = observe(cfg(), TOPO, GOV, STATES)  # type: ignore[arg-type]
    for t in run.ticks:
        for o in t.context.observations:
            assert (o.status is ObservationStatus.KNOWN) == (o.value is not None)
            assert o.status is not ObservationStatus.KNOWN or o.source_id is not None
            assert o.observed_at_tick <= o.tick


@pytest.mark.req("REQ-026")
@pytest.mark.req("REQ-027")
def test_compact_profile_is_lossless_under_omega() -> None:
    run = observe(cfg(), TOPO, GOV, STATES)  # type: ignore[arg-type]
    for t in run.ticks:
        a = omega(t.context, TOPO.attribute_universe, DECL)
        b = omega(serialize(t.context, "compact"), TOPO.attribute_universe, DECL)
        assert a == b


@pytest.mark.req("REQ-026")
@pytest.mark.req("REQ-027")
def test_budget_switches_profile_then_exhausts() -> None:
    tight = observe(cfg("ocfg:fx_tight"), TOPO, GOV, STATES)  # type: ignore[arg-type]
    profs = [t.bundle.serialization_profile if t.bundle else None for t in tight.ticks]
    assert profs == ["full"] * 4 + ["compact"] * 2
    assert tight.ticks[4].errors and tight.ticks[4].errors[0].code.value == "CONTEXT_INCOMPLETE"
    assert not tight.ticks[5].errors
    for t in tight.ticks:
        if t.bundle:
            assert t.bundle.budget_usage.observations <= 40
            assert [c.sequence for c in t.bundle.contexts] == list(range(t.tick + 1))
    ex = observe(cfg(bundle_budget={"max_observations": 20, "max_bytes": 10**7}), TOPO, GOV, STATES)  # type: ignore[arg-type]
    assert [t.bundle is None for t in ex.ticks] == [False, False, False, True, True, True]
    assert ex.ticks[2].bundle is not None and ex.ticks[2].bundle.serialization_profile == "compact"
    assert len(ex.ticks[2].errors) == 1 and "full" in ex.ticks[2].errors[0].message
    assert len(ex.ticks[3].errors) == 1 and "compact" in ex.ticks[3].errors[0].message
    assert all(e.recovery.value == "RESERIALIZE" for t in ex.ticks for e in t.errors)


@pytest.mark.req("REQ-026")
def test_source_register_continuity() -> None:
    run = observe(cfg(), TOPO, GOV, STATES)  # type: ignore[arg-type]
    reg = {e.source_id: e for e in run.register_at(5).entries}
    assert reg["src:s01"].continuity.value == "CONTINUOUS" and (reg["src:s01"].first_tick, reg["src:s01"].last_tick) == (0, 5)
    s2 = reg["src:s02"]
    assert s2.continuity.value == "INTERRUPTED" and (s2.first_tick, s2.last_tick) == (1, 5)
    assert [(g.from_tick, g.to_tick) for g in s2.gaps] == [(3, 3)]


@pytest.mark.req("REQ-024")
@pytest.mark.parametrize("upd,code", [
    ({"visible_nodes": [f"node:n{i:02d}" for i in range(1, 10)] + ["node:n99"]}, ErrorCode.SCHEMA_VIOLATION),
    ({"sources": [{"source_id": "src:s09", "label": "S", "observes": ["attr:n10/state"], "active": [{"from_tick": 0}]}]},
     ErrorCode.SCHEMA_VIOLATION),
    ({"visible_rules": ["rule:hidden_ok"]}, ErrorCode.INVALID_RULE),
    ({"visible_rules": ["rule:follow_n08"]}, ErrorCode.INVALID_RULE),
    ({"serialization_profiles": ["zip"]}, ErrorCode.SCHEMA_VIOLATION),
    ({"visible_relations": ["rel:depends_on:n10:n08"]}, ErrorCode.SCHEMA_VIOLATION),
])
def test_theta_validation(upd: dict[str, Any], code: ErrorCode) -> None:
    with pytest.raises(CiraError) as e:
        validate_config(cfg(**upd), TOPO, GOV)  # type: ignore[arg-type]
    assert e.value.code is code
