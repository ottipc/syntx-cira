"""Phase 02 gate: T03 (SYNTHETIC replay), T06 (source references via bundle and record), TX03, TX06, TX16."""

from __future__ import annotations

import ast
import json
from pathlib import Path
from typing import Any

import pytest

from app.contracts.common import load
from app.contracts.f03 import ReplayMode
from app.contracts.f04_public import TargetDefinition
from app.core.errors import CiraError
from app.experiments.orchestrator import CreateRequest, Orchestrator
from app.experiments.replay import replay
from app.store import ArtifactStore
from tests.conftest import ROOT


@pytest.fixture
def orch(tmp_path: Path) -> Orchestrator:
    return Orchestrator(ArtifactStore(tmp_path / "store"))


def run(o: Orchestrator, scn: str = "scn:fx_base", cfg: str = "ocfg:fx_partial", **kw: Any) -> str:
    e = o.create(CreateRequest(scn, cfg, "tgt:fx", **kw))
    o.run(e)
    return e


def payloads(o: Orchestrator, e: str, t: str) -> list[Any]:
    return [o.store.load_payload(x["artifact_id"], t) for x in o.store.entries(e, t)]


@pytest.mark.tid("T03")
@pytest.mark.req("REQ-018")
@pytest.mark.req("REQ-019")
@pytest.mark.req("REQ-021")
@pytest.mark.req("REQ-075")
@pytest.mark.parametrize("scn", ["scn:fx_base", "scn:fx_rec"])
def test_synthetic_replay_identical(orch: Orchestrator, scn: str) -> None:
    e = run(orch, scn)
    r = replay(orch, e, ReplayMode.SYNTHETIC)
    rep = payloads(orch, r, "replay_report")[0]
    assert rep.verdict.value == "IDENTICAL" and rep.mode is ReplayMode.SYNTHETIC
    assert {"actual_state", "event_record", "observation_bundle", "observation_record"} <= set(rep.compared_types)
    seq = lambda x: [(a["artifact_type"], a["logical_key"], a["artifact_id"]) for a in orch.store.entries(x)  # noqa: E731
                     if a["artifact_type"] not in ("experiment_definition", "replay_report")]
    assert seq(e) == seq(r)


@pytest.mark.tid("TX16")
@pytest.mark.req("REQ-019")
def test_content_addressed_ids_independent_of_experiment_and_clock(orch: Orchestrator) -> None:
    a = run(orch)
    b = run(orch)
    assert a != b
    ids = lambda x: {(r["artifact_type"], r["logical_key"]): r["artifact_id"] for r in orch.store.entries(x)}  # noqa: E731
    assert ids(a) == ids(b)
    for r in orch.store.entries(a):
        raw = json.dumps(orch.store.read_object(r["artifact_id"])[1])
        assert a not in raw and "recorded_at" not in raw
    assert all("recorded_at" in r for r in orch.store.index(a))


@pytest.mark.tid("T06")
@pytest.mark.req("REQ-026")
@pytest.mark.req("REQ-058")
def test_source_references_resolve_via_bundle_and_record(orch: Orchestrator) -> None:
    e = run(orch)
    cfg = payloads(orch, e, "observation_config")[0]
    src = {s.source_id for s in cfg.sources}
    states = {(x["artifact_id"]) for x in orch.store.entries(e, "actual_state")}
    bundles = {x["artifact_id"]: x for x in orch.store.entries(e, "observation_bundle")}
    for b in payloads(orch, e, "observation_bundle"):
        reg = {x.source_id for x in b.source_register.entries}
        rels = {r.relation_id for r in b.observable_topology.relations}
        for c in b.contexts:
            for o in c.observations:
                assert o.source_id is None or (o.source_id in src and o.source_id in reg)
                assert set(o.references) <= rels
    for entry in orch.store.entries(e, "observation_bundle"):
        prov = {r["artifact_type"] for r in entry["provenance"]["source_refs"]}
        assert prov <= {"immutable_topology", "governance_definition", "observation_config"}  # K-41
    for rec in payloads(orch, e, "observation_record"):
        assert rec.bundle_ref.artifact_id in bundles
        assert {r.artifact_id for r in rec.actual_state_refs} <= states
    rec1 = payloads(orch, e, "observation_record")[1]
    assert [orch.store.load_payload(r.artifact_id, "actual_state").tick for r in rec1.actual_state_refs] == [0, 1]


@pytest.mark.tid("TX06")
@pytest.mark.req("REQ-028")
def test_target_is_observation_based(orch: Orchestrator) -> None:
    e = run(orch)
    t = orch.store.entries(e, "target_definition")[0]
    assert {r["artifact_type"] for r in t["provenance"]["source_refs"]} <= {"observation_config", "topology_definition"}
    base = json.loads(payloads(orch, e, "target_definition")[0].model_dump_json())
    from app.experiments import catalog
    from app.observation import observable_rules, observable_topology, validate_target
    from app.topology import seal
    cfg = catalog.get("observation_config", "ocfg:fx_partial")
    topo = seal(catalog.get("topology_definition", "topo:fx_04_11"))  # type: ignore[arg-type]
    gov = catalog.get("governance_definition", "gov:fx")
    ot, orl = observable_topology(cfg, topo), observable_rules(cfg, gov)  # type: ignore[arg-type]
    validate_target(load(TargetDefinition, base), ot, orl)
    for goal in ({"goal_id": "goal:x", "subject_ref": "node:n10", "property": "GAP_CLOSED"},
                 {"goal_id": "goal:x", "subject_ref": "node:n05", "property": "RULE_SATISFIED", "rule_ref": "rule:gate_auth"},
                 {"goal_id": "goal:x", "subject_ref": "attr:n05/state", "property": "ATTRIBUTE_EQUALS", "value": "ACTIVE"}):
        bad = dict(base, goals=base["goals"] + [goal])
        with pytest.raises(CiraError):
            validate_target(load(TargetDefinition, bad), ot, orl)


@pytest.mark.tid("TX03")
@pytest.mark.req("REQ-023")
def test_emulator_has_no_observation_engine_or_f05_dependency() -> None:
    banned = ("app.observation", "app.syntx_adapter", "app.metrics", "app.contracts.f05", "app.contracts.f04",
              "app.store")
    for p in sorted((ROOT / "backend/app/emulator").rglob("*.py")):
        pkg = ["app", "emulator"]
        for node in ast.walk(ast.parse(p.read_text(encoding="utf-8"))):
            if isinstance(node, ast.ImportFrom):
                base = pkg[: len(pkg) - (node.level - 1)] if node.level else []
                mod = ".".join(base + ([node.module] if node.module else []))
                assert not mod.startswith(banned), f"{p}: {mod}"
            elif isinstance(node, ast.Import):
                assert not any(a.name.startswith(banned) for a in node.names)
    import subprocess
    r = subprocess.run(["lint-imports", "--config", ".importlinter"], cwd=ROOT / "backend", capture_output=True, text=True)
    line = next(x for x in r.stdout.replace("\n", " ").split(" KEPT") if "app.emulator must not import" in x)
    assert r.returncode == 0 and line, r.stdout


@pytest.mark.tid("T06")
@pytest.mark.req("REQ-027")
def test_context_incomplete_marks_observation_partial(orch: Orchestrator, tmp_path: Path) -> None:
    e = run(orch, cfg="ocfg:fx_tight")
    errs = [x for x in orch.store.stage_events(e) if x.error]
    assert errs and errs[0].error.code.value == "CONTEXT_INCOMPLETE"  # type: ignore[union-attr]
    assert orch.status(e).value == "COMPLETED"  # profile switch recovered without exhaustion
    bundles = payloads(orch, e, "observation_bundle")
    assert bundles[-1].serialization_profile == "compact"
