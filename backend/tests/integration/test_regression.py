"""T11 / AK-13 — documented regressions as frozen bundles (ADR-0006 Nr. 3). Each case is rebuilt from its request and
must export byte-identically; the frozen bundle imports into an empty instance and re-exports unchanged."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.api.main import create_app
from tests.conftest import ROOT

_spec = importlib.util.spec_from_file_location("freeze_regression", ROOT / "backend/scripts/freeze_regression.py")
assert _spec and _spec.loader
fr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fr)
CASES: list[dict[str, Any]] = fr.cases()
pytestmark = [pytest.mark.tid("T11"), pytest.mark.req("REQ-076")]


def test_every_case_is_documented_and_frozen() -> None:
    assert len(CASES) >= 4 and len({c["name"] for c in CASES}) == len(CASES)
    for c in CASES:
        assert c["pins"] and c["request"]
        assert fr.path_of(c).exists(), f"{c['name']} not frozen (run scripts/freeze_regression.py --freeze once)"


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_rebuild_reproduces_frozen_bundle_byte_for_byte(case: dict[str, Any], tmp_path: Path) -> None:
    frozen = fr.path_of(case).read_text(encoding="utf-8")
    assert fr.serialise(fr.build(case, tmp_path)) == frozen


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_frozen_bundle_imports_and_reexports_unchanged(case: dict[str, Any], tmp_path: Path) -> None:
    b = json.loads(fr.path_of(case).read_text(encoding="utf-8"))
    c = TestClient(create_app(tmp_path, background=False))
    r = c.post("/experiments/import", json=b)
    assert r.status_code == 201, r.text
    assert c.get(f"/experiments/{b['experiment_id']}/export").json() == b
