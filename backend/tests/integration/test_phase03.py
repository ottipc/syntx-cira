"""Phase 03 gate: T04b, T05, T08, T10, T12, TX04 (orchestrator on behalf), TX05 (L5 leak mutation), TX10, TX18,
plus the vertical API walkthrough (REQ-059, REQ-071)."""

from __future__ import annotations

import ast
import json
import sys
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.api.main import create_app
from app.contracts.common import load, make_ref
from app.contracts.f03 import ExperimentDefinition, ScenarioDefinition
from app.experiments.orchestrator import CreateRequest, Orchestrator
from app.store import ArtifactStore
from tests.conftest import FIXTURES, ROOT

sys.path.insert(0, str(ROOT / "tools"))
BASE = {"scenario_id": "scn:fx_base", "observation_config_id": "ocfg:fx_partial", "target_definition_id": "tgt:fx"}


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(tmp_path / "data", background=False))


@pytest.fixture
def orch(tmp_path: Path) -> Orchestrator:
    return Orchestrator(ArtifactStore(tmp_path / "store"))


def start(c: TestClient, **kw: Any) -> str:
    r = c.post("/experiments", json={**BASE, **kw})
    assert r.status_code == 202, r.text
    return str(r.json()["experiment_id"])


def payloads(o: Orchestrator, e: str, t: str) -> list[Any]:
    return [o.store.load_payload(x["artifact_id"], t) for x in o.store.entries(e, t)]


# ---- T04b ---------------------------------------------------------------------------------------------------------
@pytest.mark.tid("T04b")
@pytest.mark.req("REQ-028")
@pytest.mark.req("REQ-035")
def test_f05_has_no_actual_state_or_emulator_dependency() -> None:
    banned = ("app.emulator", "app.observation", "app.metrics", "app.experiments", "app.api", "app.store",
              "app.contracts.f03", "app.contracts.f04_record", "app.contracts.f06", "app.contracts.f07",
              "app.contracts.registry", "app.contracts.experiments")
    for p in sorted((ROOT / "backend/app/syntx_adapter").rglob("*.py")):
        rel = p.relative_to(ROOT / "backend").with_suffix("").parts
        pkg = list(rel[:-1]) if rel[-1] != "__init__" else list(rel[:-1])
        for node in ast.walk(ast.parse(p.read_text(encoding="utf-8"))):
            if isinstance(node, ast.ImportFrom):
                base = pkg[: len(pkg) - (node.level - 1)] if node.level else []
                mod = ".".join(base + ([node.module] if node.module else []))
                assert not mod.startswith(banned), f"{p}: {mod}"
                assert "ActualState" not in {a.name for a in node.names}
    import subprocess
    r = subprocess.run(["lint-imports", "--config", ".importlinter"], cwd=ROOT / "backend", capture_output=True, text=True)
    assert r.returncode == 0 and "0 broken" in r.stdout


# ---- T05 ----------------------------------------------------------------------------------------------------------
@pytest.mark.tid("T05")
@pytest.mark.req("REQ-036")
@pytest.mark.req("REQ-037")
def test_fixture_adapter_contract(orch: Orchestrator) -> None:
    e = orch.create(CreateRequest("scn:fx_base", "ocfg:fx_partial", "tgt:fx"))
    orch.run(e)
    assert orch.status(e).value == "COMPLETED"
    runs = payloads(orch, e, "sweep_run")
    assert runs and all(r.adapter.is_fixture and r.adapter.kind.value == "FIXTURE" for r in runs)
    assert all(r.execution_status.value == "COMPLETED" for r in runs)
    for x in orch.store.entries(e):
        if x["artifact_type"] in ("sweep_run", "forward_result", "inverse_result", "reconstruction_result",
                                  "recovery_proposal", "operator_registry"):
            assert x["provenance"]["data_origin"] == "FIXTURE"


@pytest.mark.tid("T05")
@pytest.mark.req("REQ-034")
@pytest.mark.req("REQ-036")
@pytest.mark.parametrize("kind", ["LOCAL", "API"])
def test_stub_adapters_report_engine_unavailable(orch: Orchestrator, kind: str) -> None:
    e = orch.create(CreateRequest("scn:fx_base", "ocfg:fx_partial", "tgt:fx", adapter=kind, adapter_config=f"adcfg:{kind.lower()}"))
    orch.run(e)
    assert orch.status(e).value == "BLOCKED"
    runs = payloads(orch, e, "sweep_run")
    assert runs and all(r.execution_status.value == "BLOCKED" and r.termination is None for r in runs)
    assert all(r.error is not None and r.error.code.value == "ENGINE_UNAVAILABLE" for r in runs)
    assert not orch.store.entries(e, "forward_result") and not orch.store.entries(e, "reconstruction_result")
    assert all(x["provenance"]["data_origin"] == "SYNTHETIC" for x in orch.store.entries(e, "sweep_run"))
    rep = payloads(orch, e, "evaluation_report")[-1]
    m01 = [r for r in rep.results if r.metric_id.value == "M01" and r.aggregation.value == "POOLED"]
    assert m01[0].status.value == "UNDEFINED" and m01[0].undefined_reason.value == "INPUT_MISSING"


def import_doc(t: int, attempt: int = 0) -> dict[str, Any]:
    fx = json.loads((FIXTURES / "f05_reconstructions" / "fx_base.json").read_text(encoding="utf-8"))
    e = next(x for x in fx["ticks"] if x["tick"] == t)

    def part(d: str) -> dict[str, Any]:
        p = e[d]
        out = {"output": {k: p[k] for k in ("values", "relations", "gaps", "open_relations")},
               "trace": p["trace"], "termination": p["termination"]}
        if d == "inverse":
            out["target_assessment"] = p["target_assessment"]
        return out
    return {"tick": t, "attempt": attempt, "engine_version": "external-test-document", "forward": part("forward"),
            "inverse": part("inverse"), "proposals": e["proposals"]}


@pytest.mark.tid("T05")
@pytest.mark.tid("TX10")
@pytest.mark.req("REQ-034")
@pytest.mark.req("REQ-037")
@pytest.mark.req("REQ-057")
def test_import_adapter_validates_and_marks_imported(client: TestClient) -> None:
    e = start(client, adapter="LOCAL")
    assert client.get(f"/experiments/{e}").json()["experiment"]["status"] == "BLOCKED"
    bad = import_doc(5)
    bad["forward"]["output"]["values"][0]["status"] = "MAYBE"
    r = client.post(f"/experiments/{e}/results/import", json=bad)
    assert r.status_code == 422 and r.json()["error"]["code"] == "IMPORT_INVALID"
    r = client.post(f"/experiments/{e}/results/import", json=import_doc(5))
    assert r.status_code == 201, r.text
    refs = r.json()["artifact_refs"]
    assert {x["artifact_type"] for x in refs} >= {"sweep_run", "forward_result", "inverse_result", "reconstruction_result"}
    res = client.get(f"/experiments/{e}/results?tick=5").json()
    assert res["reconstruction"]["availability"] == "AVAILABLE" and res["reconstruction"]["origin"] == "IMPORTED"
    assert res["header"]["data_origin"] == "IMPORTED"
    assert client.get(f"/experiments/{e}").json()["experiment"]["status"] == "PARTIAL"
    m = client.get(f"/experiments/{e}/metrics").json()
    assert m["report"]["data_origin"] == "IMPORTED"


# ---- T08 / T12 ------------------------------------------------------------------------------------------------------
@pytest.mark.tid("T08")
@pytest.mark.tid("T12")
@pytest.mark.req("REQ-029")
@pytest.mark.req("REQ-030")
@pytest.mark.req("REQ-032")
@pytest.mark.req("REQ-033")
def test_independent_sweeps_and_termination(orch: Orchestrator) -> None:
    e = orch.create(CreateRequest("scn:fx_base", "ocfg:fx_partial", "tgt:fx"))
    orch.run(e)
    runs = payloads(orch, e, "sweep_run")
    ids = [r.sweep_id for r in runs]
    assert len(ids) == len(set(ids)) == 2 * 6 + 2  # 6 ticks × 2 directions + stability attempt 1 at t5
    for r in runs:
        if r.direction.value == "FORWARD":
            assert r.target_ref is None
        else:
            assert r.target_ref is not None
        if r.execution_status.value != "BLOCKED":
            assert r.termination is not None  # T12
        assert r.context_version == f"ctx:{r.up_to_tick}"
        b = orch.store.load_payload(r.input_bundle_ref.artifact_id, "observation_bundle")
        assert b.up_to_tick == r.up_to_tick and [c.tick for c in b.contexts] == list(range(r.up_to_tick + 1))  # Ω_O(0:t)
    for f in payloads(orch, e, "forward_result"):
        raw = json.dumps(f.model_dump(mode="json"))
        assert "inverse_result" not in raw and "sweep:inv" not in raw
    for i in payloads(orch, e, "inverse_result"):
        raw = json.dumps(i.model_dump(mode="json"))
        assert "forward_result" not in raw and "sweep:fwd" not in raw
    recs = {(r.up_to_tick, r.attempt): r for r in payloads(orch, e, "reconstruction_result")}
    assert (5, 1) in recs and recs[(5, 1)].reconstruction_id == "recon:t5:a1"
    assert recs[(5, 0)].merge.forward_ref.artifact_type == "forward_result"
    assert recs[(5, 0)].merge.inverse_ref.artifact_type == "inverse_result"
    assert recs[(3, 0)].merge.conflicts and recs[(3, 0)].merge.conflicts[0].attribute_ref == "attr:n07/state"
    assert recs[(1, 0)].delta_state is not None and recs[(0, 0)].delta_state is None
    for g in recs[(5, 0)].output.gaps:
        assert g.source_refs  # GAPs with source reference (REQ-032)


@pytest.mark.req("REQ-038")
def test_no_automatic_application_of_proposals(orch: Orchestrator) -> None:
    e = orch.create(CreateRequest("scn:fx_base", "ocfg:fx_partial", "tgt:fx"))
    orch.run(e)
    props = payloads(orch, e, "recovery_proposal")
    assert props and all(p.status == "PROPOSED" for p in props)
    assert not orch.store.entries(e, "authority_record")
    assert len(orch.store.entries(e, "scenario_definition")) == 1


# ---- T10 ----------------------------------------------------------------------------------------------------------
@pytest.mark.tid("T10")
@pytest.mark.req("REQ-012")
@pytest.mark.req("REQ-021")
@pytest.mark.req("REQ-074")
def test_export_import_export_identical_hash(client: TestClient, tmp_path: Path) -> None:
    e = start(client)
    b1 = client.get(f"/experiments/{e}/export").json()
    other = TestClient(create_app(tmp_path / "other", background=False))
    r = other.post("/experiments/import", json=b1)
    assert r.status_code == 201, r.text
    assert r.json()["experiment_id"] == e
    b2 = other.get(f"/experiments/{e}/export").json()
    assert b1["bundle_hash"] == b2["bundle_hash"] and b1 == b2
    assert other.post("/experiments/import", json=b1).status_code == 409
    tampered = json.loads(json.dumps(b1))
    tampered["artifacts"][0]["logical_key"] = "x"
    assert other.post("/experiments/import", json=tampered).json()["error"]["code"] == "IMPORT_INVALID"
    assert "recorded_at" not in json.dumps(b1)


# ---- TX04 / TX18 ----------------------------------------------------------------------------------------------------
@pytest.mark.tid("TX04")
@pytest.mark.tid("TX18")
@pytest.mark.req("REQ-060")
@pytest.mark.req("REQ-035")
def test_orchestrator_acts_on_behalf_and_coupling_graph(client: TestClient) -> None:
    from coupling_audit import audit
    e = start(client)
    for p in ("", "/observations?tick=2", "/results", "/metrics", "/topology", "/governance?tick=2&space=O",
              "/states?tick=2", "/events", "/results/sweep:fwd:t3:a0/trace"):
        assert client.get(f"/experiments/{e}{p}").status_code == 200
    store = client.app.state.control.store  # type: ignore[attr-defined]
    log = store.index(e) + store.memory_access
    a = audit(log)
    assert a["violations"] == [] and a["outside_matrix"] == [] and a["dead_edges"] == []
    f05 = {r["artifact_type"] for r in log if r.get("kind") == "access" and r["field"] == "F05"}
    own = {"sweep_run", "forward_result", "inverse_result", "reconstruction_result", "recovery_proposal",
           "operator_registry"}
    assert f05 <= {"observation_bundle", "target_definition"} | own  # inputs (K-11) plus its own outputs
    assert "actual_state" not in f05 and "observation_record" not in f05


# ---- TX05 (L5 leak mutation) ----------------------------------------------------------------------------------------
@pytest.mark.tid("TX05")
@pytest.mark.req("REQ-061")
@pytest.mark.req("REQ-035")
def test_hidden_omega_a_mutation_does_not_reach_f05(orch: Orchestrator) -> None:
    e1 = orch.create(CreateRequest("scn:fx_base", "ocfg:fx_partial", "tgt:fx"))
    orch.run(e1)

    def mutated(change: dict[str, Any]) -> str:
        defs = orch.definition_payloads(e1)
        ed = defs.pop("experiment_definition")
        assert isinstance(ed, ExperimentDefinition)
        s = json.loads(defs["scenario_definition"].model_dump_json())
        for v in s["initial_state"]:
            if v["attribute_ref"] in change:
                v["value"] = change[v["attribute_ref"]]
        s["inputs"] = s["inputs"] + [{"event_id": "evt:hidden", "tick": 4, "seq": 99, "kind": "SET_ATTRIBUTE",
                                      "attribute_ref": "attr:n10/state", "value": "FAULTY"}]
        scn = load(ScenarioDefinition, s)
        defs["scenario_definition"] = scn
        ed2 = ExperimentDefinition.model_validate_json(ed.model_copy(update={
            "scenario_ref": make_ref("scenario_definition", scn), "label": "mutation"}).model_dump_json())
        x = orch.create_from(defs, ed2)
        orch.run(x)
        return x
    hidden = mutated({"attr:n10/state": "NOMINAL", "attr:n08/state": "FAULTY", "attr:n09/state": "DENIED"})

    def f05(x: str) -> dict[tuple[str, str], str]:
        return {(r["artifact_type"], r["logical_key"]): r["artifact_id"] for r in orch.store.entries(x)
                if r["artifact_type"] in ("observation_bundle", "sweep_run", "forward_result", "inverse_result",
                                          "reconstruction_result", "recovery_proposal")}
    assert f05(e1) == f05(hidden)  # F05 inputs and outputs byte-identical under unobservable Ω_A mutation
    a1 = {r["logical_key"]: r["artifact_id"] for r in orch.store.entries(e1, "actual_state")}
    a2 = {r["logical_key"]: r["artifact_id"] for r in orch.store.entries(hidden, "actual_state")}
    assert a1 != a2  # the mutation happened
    visible = mutated({"attr:n01/state": "DEGRADED"})
    b1 = {r["logical_key"]: r["artifact_id"] for r in orch.store.entries(e1, "observation_bundle")}
    b3 = {r["logical_key"]: r["artifact_id"] for r in orch.store.entries(visible, "observation_bundle")}
    assert b1 != b3  # sensitivity: an observable change does reach the bundle


# ---- TX10 ---------------------------------------------------------------------------------------------------------
@pytest.mark.tid("TX10")
@pytest.mark.req("REQ-037")
@pytest.mark.req("REQ-057")
def test_data_origin_propagation(client: TestClient) -> None:
    e = start(client)
    v = client.get(f"/experiments/{e}").json()
    assert v["experiment"]["data_origin"] == "FIXTURE"
    assert all(s["data_origin"] == "FIXTURE" for s in v["experiment"]["sweeps"])
    r = client.get(f"/experiments/{e}/results").json()
    assert {r[b]["origin"] for b in ("forward", "inverse", "reconstruction")} == {"FIXTURE"}
    assert r["header"]["data_origin"] == "FIXTURE"
    assert client.get(f"/experiments/{e}/metrics").json()["header"]["data_origin"] == "FIXTURE"
    assert client.get(f"/experiments/{e}/states?tick=1").json()["header"]["data_origin"] == "SYNTHETIC"
    assert client.get(f"/experiments/{e}/observations?tick=1").json()["observation"]["origin"] == "SYNTHETIC"


# ---- vertical walkthrough ---------------------------------------------------------------------------------------------
@pytest.mark.req("REQ-059")
@pytest.mark.req("REQ-071")
@pytest.mark.req("REQ-077")
@pytest.mark.req("REQ-047")
@pytest.mark.req("REQ-046")
def test_api_walkthrough_all_entries(client: TestClient) -> None:
    h = client.get("/health").json()
    assert h["status"] == "ok" and {a["descriptor"]["kind"] for a in h["adapters"]} == {"FIXTURE", "IMPORT", "LOCAL", "API"}
    sc = client.get("/scenarios").json()["scenarios"]
    assert {s["scenario_id"] for s in sc} == {"scn:fx_base", "scn:fx_rec"} and all(s["observation_configs"] for s in sc)
    assert client.get("/scenarios?variant_kind=RECOVERY").json()["scenarios"][0]["variant_of"] == "scn:fx_base"
    b = start(client)
    r = start(client, scenario_id="scn:fx_rec")
    assert {x["experiment_id"] for x in client.get("/experiments").json()["experiments"]} == {b, r}
    hdr = client.get(f"/experiments/{b}/states?tick=3").json()["header"]
    assert hdr["guard_class"] == "TIMED" and hdr["tick"] == 3 and hdr["experiment_id"] == b
    m = client.get(f"/experiments/{b}/metrics?aggregation=PER_TICK&tick=4").json()
    assert m["header"]["guard_class"] == "TIMED" and m["header"]["query_echo"]["aggregation"] == "PER_TICK"
    assert len(m["definitions"]) == 11 and all(x["tick"] == 4 for x in m["report"]["results"])
    assert client.get(f"/experiments/{b}/metrics?aggregation=POOLED&tick=4").status_code == 422
    rng = client.get(f"/experiments/{b}/metrics?to_tick=2").json()
    assert rng["header"]["guard_class"] == "RANGE" and rng["header"]["query_echo"]["to_tick"] == 2
    ev = client.get(f"/experiments/{b}/events?from=1&to=2").json()
    assert ev["header"]["query_echo"] == {"attempt": None, "revision": None, "direction": None, "aggregation": None,
                                          "to_tick": None, "from": 1, "to": 2, "comparison_id": None}
    assert all(1 <= x["tick"] <= 2 for x in ev["events"])
    c = client.post("/comparisons", json={"baseline_experiment_id": b, "recovery_experiment_id": r})
    assert c.status_code == 201, c.text
    comp = c.json()["comparison"]
    assert comp["compatible"] and comp["comparison_tick"] == 5
    m9 = comp["results"][0]
    assert m9["metric_id"] == "M09" and (m9["numerator"], m9["denominator"]) == ({"n": 3, "d": 1}, {"n": 4, "d": 1})
    assert sorted(comp["persisting"]) == ["rule:hidden_ok|node:n10"]
    cid = comp["comparison_key"]
    assert client.get(f"/comparisons/{cid}").json()["header"]["query_echo"]["comparison_id"] == cid
    assert client.get(f"/comparisons?experiment_id={b}").json()["comparisons"][0]["comparison_id"] == cid
    bad = client.post("/comparisons", json={"baseline_experiment_id": r, "recovery_experiment_id": b})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "COMPARISON_INCOMPATIBLE"
    rs = client.post(f"/experiments/{b}/sweeps", json={"ticks": [5]})
    assert rs.status_code == 202 and rs.json()["sweep_ids"] == ["sweep:fwd:t5:a2", "sweep:inv:t5:a2"]
    rp = client.post(f"/experiments/{b}/replay", json={"mode": "PRESERVED_ENGINE"})
    assert rp.status_code == 202
    rr = client.get(f"/experiments/{rp.json()['experiment_id']}/replay-report").json()
    assert rr["report"]["verdict"] == "IDENTICAL" and rr["report"]["mode"] == "PRESERVED_ENGINE"
    f = client.get(f"/fields?experiment_id={b}&tick=2").json()
    assert len(f["manifests"]) == 7 and f["configuration_snapshot"]["scenario_id"] == "scn:fx_base"
    assert f["header"]["guard_class"] == "TIMED"
    tr = client.get(f"/experiments/{b}/results/sweep:fwd:t3:a0/trace").json()
    assert tr["trace"]["availability"] == "AVAILABLE" and all(v == "LABEL_UNAVAILABLE" for _, v in tr["registry_labels"])
    nf = client.get("/experiments/exp:000000000000-0")
    assert nf.status_code == 404 and nf.json()["error"]["code"] == "NOT_FOUND"
    v = client.post("/recovery-variants", json={"experiment_id": b, "proposal_id": "prop:authorize_gate",
                                                 "role_ref": "role:supervisor", "decision": "APPROVED",
                                                 "rationale": "test decision",
                                                 "inputs": [{"event_id": "evt:v1", "tick": 2, "seq": 0, "kind": "SET_ATTRIBUTE",
                                                             "attribute_ref": "attr:n05/state", "value": "CLOSED"}]})
    assert v.status_code == 201 and v.json()["scenario_ref"] is not None
    res = client.get(f"/experiments/{b}/results?tick=5").json()
    assert res["authority_records"] and res["authority_records"][-1]["created_scenario_ref"] is not None


@pytest.mark.tid("T08")
@pytest.mark.req("REQ-033")
def test_schedule_final_yields_m03_r_input_missing(client: TestClient) -> None:
    e = start(client, sweep_schedule={"mode": "FINAL", "ticks": []})
    m = client.get(f"/experiments/{e}/metrics").json()["report"]["results"]
    m03r = [x for x in m if x["metric_id"] == "M03" and x["relation"] == "R"]
    assert m03r and m03r[0]["status"] == "UNDEFINED" and m03r[0]["undefined_reason"] == "INPUT_MISSING"
    assert [s["up_to_tick"] for s in client.get(f"/experiments/{e}").json()["experiment"]["sweeps"]] == [5, 5, 5, 5]
