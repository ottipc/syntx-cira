"""IC-18 — reads during a background run never see a torn index record (the API answered 422 SCHEMA_VIOLATION when a
status poll hit an append in progress). REQ-059 (control flow), REQ-021 (versioned history / StageEvents)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.api.main import create_app
from app.store import ArtifactStore

BASE = {"scenario_id": "scn:fx_base", "observation_config_id": "ocfg:fx_partial", "target_definition_id": "tgt:fx"}
pytestmark = [pytest.mark.req("REQ-059"), pytest.mark.req("REQ-021")]


def test_unterminated_last_index_line_is_not_read(tmp_path: Path) -> None:
    s = ArtifactStore(tmp_path)
    s.meta("exp:aaaa-0", {"label": "x"})
    p = s._index_path("exp:aaaa-0")  # noqa: SLF001 — the test simulates an append in progress
    with p.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"kind": "meta", "experiment_id": "exp:aaaa-0", "label": "half"})[:25])
    assert [r["label"] for r in s.index("exp:aaaa-0")] == ["x"]
    assert s.experiments() == ["exp:aaaa-0"]


@pytest.mark.parametrize("trial", range(3))
def test_status_polls_during_a_background_run_always_answer(tmp_path: Path, trial: int) -> None:
    c = TestClient(create_app(tmp_path / f"d{trial}", background=True))
    r = c.post("/experiments", json=BASE)
    assert r.status_code == 202
    e = r.json()["experiment_id"]
    for _ in range(5000):
        x = c.get(f"/experiments/{e}")
        assert x.status_code == 200, x.text[:300]
        assert c.get("/experiments").status_code == 200
        if x.json()["experiment"]["status"] in ("COMPLETED", "PARTIAL", "FAILED", "BLOCKED"):
            break
    assert x.json()["experiment"]["status"] == "COMPLETED"
