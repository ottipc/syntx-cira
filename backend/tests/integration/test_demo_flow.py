"""AK-11 / REQ-076 — the demo as a test (15.10 step 5): every narrated claim of the eight demo steps (G05.3) is checked
against the API of a freshly built baseline/recovery pair, using the same step data the GUI navigates
(frontend/src/demo/demo.steps.json). No value is asserted that the API did not produce; FIXTURE stays FIXTURE."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.api.main import create_app
from tests.conftest import ROOT

STEPS: list[dict[str, Any]] = json.loads((ROOT / "frontend/src/demo/demo.steps.json").read_text(encoding="utf-8"))["steps"]
BASE = {"scenario_id": "scn:fx_base", "observation_config_id": "ocfg:fx_partial", "target_definition_id": "tgt:fx",
        "label": "Baseline"}
pytestmark = [pytest.mark.req("REQ-076")]


@pytest.fixture(scope="module")
def demo(tmp_path_factory: pytest.TempPathFactory) -> dict[str, Any]:
    c = TestClient(create_app(tmp_path_factory.mktemp("demo"), background=False))
    b = c.post("/experiments", json=BASE).json()["experiment_id"]
    r = c.post("/experiments", json={**BASE, "scenario_id": "scn:fx_rec", "label": "Recovery"}).json()["experiment_id"]
    cmp_ = c.post("/comparisons", json={"baseline_experiment_id": b, "recovery_experiment_id": r})
    assert cmp_.status_code in (200, 201), cmp_.text
    return {"c": c, "b": b, "r": r, "cid": cmp_.json()["comparison"]["comparison_key"]}


def step(n: int) -> dict[str, Any]:
    return next(s for s in STEPS if s["n"] == n)


def get(d: dict[str, Any], url: str) -> Any:
    res = d["c"].get(url)
    assert res.status_code == 200, f"{url}: {res.status_code} {res.text[:300]}"
    return res.json()


def test_script_has_eight_steps_with_narration_and_expected_signs() -> None:
    assert [s["n"] for s in STEPS] == list(range(1, 9))
    assert all(s["narration"] == f"demo.{s['n']}" and s["expect"] for s in STEPS)


def test_step1_three_states_and_a_barrier(demo: dict[str, Any]) -> None:
    s = step(1)
    x = get(demo, f"/experiments/{demo['b']}")["experiment"]
    assert x["status"] == "COMPLETED" and x["data_origin"] == "FIXTURE"
    f = get(demo, f"/fields?experiment_id={demo['b']}&tick={s['tick']}")
    assert [m["field_id"] for m in f["manifests"]] == ["F01", "F02", "F03", "F04", "F05", "F06", "F07"]
    caps = json.loads((ROOT / "contracts/coupling_matrix.json").read_text(encoding="utf-8"))["capabilities"]
    assert "F05" not in caps["actual_state"]["R"], "the engine field never reads the reference state (barrier)"


def test_step2_reference_changes_and_observation_sees_it(demo: dict[str, Any]) -> None:
    s = step(2)
    a = s["focus"]
    st = get(demo, f"/experiments/{demo['b']}/states?tick={s['tick']}")
    change = next(ch for ch in st["delta"]["changes"] if ch["attribute_ref"] == a)
    assert change["before"]["value"] != change["after"]["value"]
    ob = get(demo, f"/experiments/{demo['b']}/observations?tick={s['tick']}")["observation"]["content"]
    p = next(p for p in ob["projected"] if p["attribute_ref"] == a)
    assert p["status"] == "KNOWN" and p["value"] == change["after"]["value"] and not p["stale"]
    assert a in [ch["attribute_ref"] for ch in ob["delta"]["changes"]]


def test_step3_what_is_not_observed_stays_open(demo: dict[str, Any]) -> None:
    s = step(3)
    ob = get(demo, f"/experiments/{demo['b']}/observations?tick={s['tick']}")["observation"]["content"]
    st = get(demo, f"/experiments/{demo['b']}/states?tick={s['tick']}")
    nodes = {f"node:{v['attribute_ref'][5:].split('/')[0]}" for v in st["values"]}
    assert nodes - set(ob["visible_nodes"]), "some node lies outside the observation window (SEM-031)"
    assert any(p["status"] == "UNKNOWN" for p in ob["projected"]), "some attribute is not observed (SEM-006)"
    rec = get(demo, f"/experiments/{demo['b']}/results?tick={s['tick']}&attempt=0&direction=merged")["reconstruction"]
    assert any(v["status"] == "UNDETERMINED" for v in rec["content"]["output"]["values"]), "something stays undetermined (SEM-007)"


def test_step4_engine_fills_gaps_from_observations_and_differences_show(demo: dict[str, Any]) -> None:
    s = step(4)
    a = s["focus"]
    ob = get(demo, f"/experiments/{demo['b']}/observations?tick={s['tick']}")["observation"]["content"]
    assert next(p for p in ob["projected"] if p["attribute_ref"] == a)["status"] == "UNKNOWN"
    rec = get(demo, f"/experiments/{demo['b']}/results?tick={s['tick']}&attempt=0&direction=merged")["reconstruction"]
    v = next(v for v in rec["content"]["output"]["values"] if v["attribute_ref"] == a)
    assert v["status"] == "DETERMINED" and v["epistemic_class"] != "SOURCE_OBSERVATION"
    assert rec["origin"] == "FIXTURE"
    m = get(demo, f"/experiments/{demo['b']}/metrics?aggregation=PER_TICK&tick={s['tick']}")["report"]
    assert any(x["delta"] == 1 for x in m["attribute_membership"]), "a reconstructed value differs from the reference (SEM-035)"


def test_step5_two_independent_paths_with_own_traces(demo: dict[str, Any]) -> None:
    t = step(5)["tick"]
    res = get(demo, f"/experiments/{demo['b']}/results?tick={t}&attempt=0")
    fwd, inv = res["forward"]["content"]["sweep"], res["inverse"]["content"]["sweep"]
    assert (fwd["direction"], inv["direction"]) == ("FORWARD", "INVERSE") and fwd["sweep_id"] != inv["sweep_id"]
    assert fwd["input_bundle_ref"] == inv["input_bundle_ref"], "both paths read the same observation bundle"
    assert fwd["target_ref"] is None and inv["target_ref"]["artifact_type"] == "target_definition"
    result_ids = {r["artifact_id"] for r in res["header"]["source_refs"]}
    for d, other in (("fwd", inv["sweep_id"]), ("inv", fwd["sweep_id"])):
        steps = get(demo, f"/experiments/{demo['b']}/results/sweep:{d}:t{t}:a0/trace")["trace"]["content"]["steps"]
        assert steps, f"{d} has its own trace"
        refs = {x for s_ in steps for x in s_["input_refs"] + s_["output_refs"]}
        assert not refs & (result_ids | {other}), f"{d} trace does not consume the other path"
        assert all(s_["engine_note"] for s_ in steps), "fixture steps say that no engine ran (DEP-02)"


def test_step6_exact_fractions_no_overall_score(demo: dict[str, Any]) -> None:
    s = step(6)
    m = get(demo, f"/experiments/{demo['b']}/metrics?aggregation={s['aggregation']}")
    rep = m["report"]
    assert rep["data_origin"] == "FIXTURE"
    assert rep["results"]
    for r in rep["results"]:
        if r["status"] == "EVALUATED":
            assert r["numerator"] and r["denominator"] and r["denominator"]["n"] != 0
        else:
            assert r["undefined_reason"] in ("ZERO_DENOMINATOR", "INPUT_MISSING")
    assert not {"overall", "score", "composite", "index"} & set(rep), "no composite value in the report"
    assert {d["metric_id"] for d in m["definitions"]} >= {r["metric_id"] for r in rep["results"]}
    assert any(r["metric_id"] == "M10" and r["status"] == "EVALUATED" for r in rep["results"]), "stability (attempt 1) is measured"


def test_step7_recovery_variant_approved_by_a_human_measured_against_baseline(demo: dict[str, Any]) -> None:
    c = get(demo, f"/comparisons/{demo['cid']}")["comparison"]
    assert c["compatible"] is True
    m09 = next(r for r in c["results"] if r["metric_id"] == "M09")
    assert m09["status"] == "EVALUATED"
    assert (m09["numerator"]["n"], m09["denominator"]["n"]) == (len(c["resolved"]), len(c["original"]))
    ev = get(demo, f"/experiments/{demo['r']}/events")["events"]
    approvals = [e for e in ev if e["kind"] == "APPLY_APPROVAL" and e["status"] == "APPLIED"]
    assert approvals, "the recovery variant contains an applied approval"
    gov = json.loads((ROOT / "synthetic_fixtures/f02_governance/fx_gov.json").read_text(encoding="utf-8"))
    scn = json.loads((ROOT / "synthetic_fixtures/f03_scenarios/fx_scn_rec.json").read_text(encoding="utf-8"))
    rec_approval = next(i["approval"] for i in scn["inputs"] if i["kind"] == "APPLY_APPROVAL")
    assert rec_approval["decision"] == "APPROVED" and rec_approval["role_ref"] in {r["role_id"] for r in gov["roles"]}


def test_step8_everything_exportable_and_reproducible(demo: dict[str, Any], tmp_path: Path) -> None:
    b1 = get(demo, f"/experiments/{demo['b']}/export")
    assert b1["bundle_hash"].startswith("sha256:")
    other = TestClient(create_app(tmp_path / "other", background=False))
    assert other.post("/experiments/import", json=b1).status_code == 201
    assert other.get(f"/experiments/{demo['b']}/export").json() == b1
