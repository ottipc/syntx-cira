"""Architecture boundary tests: TX01 manifests, TX02 drift, TX04 capabilities, TX08 clock/random,
TX09 fixture lint, TX11 operator lint, TX12 trace_check, L2 import rules."""

from __future__ import annotations

import ast
import importlib
import json
import subprocess
import sys
from pathlib import Path

import pytest
from pydantic import BaseModel

from app.contracts.common import FieldId, Provenance
from app.contracts.registry import ARTIFACT_TYPES
from app.store import AccessViolation, FieldReader, FieldWriter, capabilities
from tests.conftest import ROOT

MATRIX = json.loads((ROOT / "contracts" / "coupling_matrix.json").read_text(encoding="utf-8"))
sys.path.insert(0, str(ROOT / "tools"))


def run(*cmd: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(list(cmd), cwd=ROOT, capture_output=True, text=True)


# ---- TX01 -----------------------------------------------------------------------------------------------
@pytest.mark.tid("TX01")
@pytest.mark.req("REQ-001")
@pytest.mark.req("REQ-003")
@pytest.mark.req("REQ-004")
@pytest.mark.req("REQ-009")
@pytest.mark.parametrize("fid", [f"F0{i}" for i in range(1, 8)])
def test_field_manifest_consistent_with_code_and_matrix(fid: str) -> None:
    man = json.loads((ROOT / "contracts" / "fields" / f"{fid}.field.json").read_text(encoding="utf-8"))
    assert man["field_id"] == fid and man["package"] == MATRIX["field_packages"][fid]
    caps = MATRIX["capabilities"]
    assert sorted(man["writes"]) == sorted(t for t, c in caps.items() if fid in c["W"])
    assert sorted(man["reads"]) == sorted(t for t, c in caps.items() if fid in c["R"] and fid not in c["W"])
    assert set(man["writes"]) | set(man["reads"]) <= set(ARTIFACT_TYPES)
    mod = importlib.import_module(man["package"])
    exported = set(getattr(mod, "__all__", ()))
    for port in man["ports"]:
        assert port in exported and callable(getattr(mod, port)), f"{fid}: port {port} not exported"
    outs = {b for a, b, _ in MATRIX["couplings"] if a == fid}
    ins = {a for a, b, _ in MATRIX["couplings"] if b == fid}
    assert set(man["couplings_out"]) == outs and set(man["couplings_in"]) == ins
    for req in man["requirements"]:
        assert req.startswith("REQ-")
    for c in man["carriers"]:
        assert any(hasattr(importlib.import_module(f"app.contracts.{m}"), c) for m in
                   ("common", "f01", "f02", "f03", "f04_public", "f04_record", "f05", "f06", "f07")), c


@pytest.mark.tid("TX01")
def test_every_artifact_type_has_exactly_one_writer() -> None:
    caps = MATRIX["capabilities"]
    assert set(caps) == set(ARTIFACT_TYPES)
    for t, c in caps.items():
        assert len(c["W"]) == 1, t
    for a, b in MATRIX["forbidden_couplings"]:
        assert [a, b] not in [[x, y] for x, y, _ in MATRIX["couplings"]]


# ---- TX02 -----------------------------------------------------------------------------------------------
@pytest.mark.tid("TX02")
@pytest.mark.req("REQ-062")
@pytest.mark.req("REQ-065")
def test_schema_export_has_no_drift() -> None:
    r = run(sys.executable, "backend/scripts/export_schemas.py", "--check")
    assert r.returncode == 0, r.stdout + r.stderr
    bundled = json.loads((ROOT / "contracts/schemas/cira.contracts.schema.json").read_text(encoding="utf-8"))
    assert sorted(bundled["x-artifact-types"]) == sorted(ARTIFACT_TYPES)
    for t, m in ARTIFACT_TYPES.items():
        assert m.__name__ in bundled["$defs"], t


@pytest.mark.tid("TX02")
def test_importlinter_config_has_no_drift() -> None:
    r = run(sys.executable, "backend/scripts/gen_importlinter.py", "--check")
    assert r.returncode == 0, r.stdout


@pytest.mark.req("REQ-035")
@pytest.mark.req("REQ-060")
def test_import_rules_kept() -> None:
    r = subprocess.run(["lint-imports", "--config", ".importlinter"], cwd=ROOT / "backend", capture_output=True, text=True)
    assert r.returncode == 0, r.stdout[-3000:]
    assert "0 broken" in r.stdout


# ---- TX04 -----------------------------------------------------------------------------------------------
def _sample(t: str) -> BaseModel:
    raw = json.loads((ROOT / "synthetic_fixtures/bundles/fx_bundle_tx14.json").read_text(encoding="utf-8"))
    e = next(a for a in raw["artifacts"] if a["artifact_type"] == t)
    return ARTIFACT_TYPES[t].model_validate_json(json.dumps(e["payload"], ensure_ascii=False))


@pytest.mark.tid("TX04")
@pytest.mark.req("REQ-035")
@pytest.mark.req("REQ-060")
@pytest.mark.parametrize("t", sorted(ARTIFACT_TYPES))
def test_store_capabilities_per_type(t: str, tmp_store) -> None:  # type: ignore[no-untyped-def]
    caps = capabilities()[t]
    payload = _sample(t)
    for f in FieldId:
        w = FieldWriter(tmp_store, f, "exp:cap", "test")
        if f.value in caps["W"]:
            env = w.put(t, payload, "k", None)
            assert env.artifact_type == t  # type: ignore[attr-defined]
        else:
            with pytest.raises(AccessViolation):
                w.put(t, payload, "k", None)
    aid = tmp_store.entries("exp:cap", t)[0]["artifact_id"]
    for f in FieldId:
        r = FieldReader(tmp_store, f, "exp:cap")
        if f.value in caps["R"]:
            assert r.get(aid, t) == payload
        else:
            with pytest.raises(AccessViolation):
                r.get(aid, t)


@pytest.mark.tid("TX04")
@pytest.mark.req("REQ-035")
def test_f05_cannot_read_actual_state_or_records(tmp_store) -> None:  # type: ignore[no-untyped-def]
    caps = capabilities()
    f05_readable = {t for t, c in caps.items() if "F05" in c["R"]}
    assert not f05_readable & {"actual_state", "event_record", "observation_record", "scenario_definition",
                               "consistency_annotation_set", "experiment_definition", "observation_config",
                               "evaluation_report", "rule_evaluation_set", "comparison_report", "replay_report"}
    assert f05_readable >= {"observation_bundle", "target_definition"}


@pytest.mark.tid("TX04")
def test_store_write_once_and_revisions(tmp_store) -> None:  # type: ignore[no-untyped-def]
    w = FieldWriter(tmp_store, FieldId.F06, "exp:rev", "test")
    ws1 = ARTIFACT_TYPES["weight_set"].model_validate_json('{"weight_set_id":"ws:a","version":"1.0.0"}')
    ws2 = ARTIFACT_TYPES["weight_set"].model_validate_json('{"weight_set_id":"ws:a","version":"1.0.1"}')
    e1 = w.put("weight_set", ws1, "ws:a", None)
    e1b = w.put("weight_set", ws1, "ws:a", None)
    e2 = w.put("weight_set", ws2, "ws:a", None)
    assert (e1.revision, e1b.revision, e2.revision) == (0, 0, 1)
    assert e1.artifact_id == e1b.artifact_id != e2.artifact_id
    log = [r for r in tmp_store.index("exp:rev") if r["kind"] == "access"]
    assert {(r["field"], r["op"]) for r in log} == {("F06", "W")}
    assert isinstance(Provenance, type)


# ---- TX08 -----------------------------------------------------------------------------------------------
FIELD_MODULES = ["core", "contracts", "topology", "governance", "emulator", "observation", "syntx_adapter",
                 "metrics", "strategies"]
BANNED_IMPORTS = {"time", "datetime", "random", "uuid", "secrets"}


@pytest.mark.tid("TX08")
def test_no_wall_clock_or_randomness_in_field_modules() -> None:
    hits = []
    for m in FIELD_MODULES:
        for p in sorted((ROOT / "backend/app" / m).rglob("*.py")):
            tree = ast.parse(p.read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    hits += [f"{p}:{a.name}" for a in node.names if a.name.split(".")[0] in BANNED_IMPORTS]
                elif isinstance(node, ast.ImportFrom) and node.module and node.module.split(".")[0] in BANNED_IMPORTS:
                    hits.append(f"{p}:{node.module}")
                elif isinstance(node, ast.Attribute) and node.attr in ("urandom", "getrandom", "time_ns", "perf_counter"):
                    hits.append(f"{p}:{node.attr}")
    assert hits == []


# ---- TX09 / TX11 / TX12 ----------------------------------------------------------------------------------
@pytest.mark.tid("TX09")
@pytest.mark.req("REQ-080")
def test_fixture_lint() -> None:
    import fixture_lint
    assert fixture_lint.lint() == []


@pytest.mark.tid("TX09")
@pytest.mark.req("REQ-080")
def test_fixture_lint_detects_violations(tmp_path: Path) -> None:
    import fixture_lint
    (tmp_path / "x.json").write_text(json.dumps({"fixture_id": "FX", "is_fixture": False, "latitude": 1,
                                                 "label": "Stadtwerke Muster", "p": "52.5200, 13.4050"}))
    found = fixture_lint.lint(tmp_path)
    assert len(found) == 5


@pytest.mark.tid("TX11")
@pytest.mark.req("REQ-007")
def test_operator_lint_clean() -> None:
    import lint_operators
    assert lint_operators.scan([ROOT / "backend/app", ROOT / "tools"]) == []


@pytest.mark.tid("TX11")
def test_operator_lint_detects_attribute_comparisons(tmp_path: Path) -> None:
    import lint_operators
    p = tmp_path / "bad.py"
    p.write_text("def f(op_ref, s, e):\n    if op_ref.symbol == '>': pass\n    if s.sigma_id in ('x',): pass\n"
                 "    match op_ref.namespace:\n        case 'R': pass\n    if op_ref.code == 'R01': pass\n"
                 "    if e.code is None: pass\n")
    old = lint_operators.ROOT
    lint_operators.ROOT = tmp_path
    try:
        assert len(lint_operators.scan([p])) == 4
    finally:
        lint_operators.ROOT = old


@pytest.mark.tid("TX12")
def test_trace_check_clean() -> None:
    import trace_check
    assert trace_check.check() == []
