"""ADR-0004 §6: the ω used by F06 equals the ω of F04 (K-09) on every fixture context, under both profiles."""

from __future__ import annotations

import pytest

from app.emulator import run_scenario
from app.experiments import catalog
from app.metrics.evaluate import omega_f06
from app.observation import observe, omega, serialize
from app.topology import seal
from app.topology.validate import declared_applicability


@pytest.mark.tid("T06")
@pytest.mark.req("REQ-024")
@pytest.mark.parametrize("scn,cfg", [("scn:fx_base", "ocfg:fx_partial"), ("scn:fx_rec", "ocfg:fx_tight")])
def test_f06_omega_equals_f04_omega(scn: str, cfg: str) -> None:
    topo = seal(catalog.get("topology_definition", "topo:fx_04_11"))  # type: ignore[arg-type]
    gov = catalog.get("governance_definition", "gov:fx")
    states = run_scenario(catalog.get("scenario_definition", scn), topo, gov).states  # type: ignore[arg-type]
    run = observe(catalog.get("observation_config", cfg), topo, gov, states)  # type: ignore[arg-type]
    decl = declared_applicability(topo.definition)
    for to in run.ticks:
        a = omega(to.context, topo.attribute_universe, decl)
        if to.bundle is None:
            continue
        for prof_ctx_bundle in (to.bundle,):
            b = omega_f06(prof_ctx_bundle, to.tick, topo.attribute_universe, decl)
            assert {k: (v.status.value, v.value, v.stale) for k, v in a.items()} == b
        compact = omega(serialize(to.context, "compact"), topo.attribute_universe, decl)
        assert compact == a
