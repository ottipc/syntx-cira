from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "synthetic_fixtures"


def load_json(rel: str) -> Any:
    return json.loads((FIXTURES / rel).read_text(encoding="utf-8"))


@pytest.fixture
def tmp_store(tmp_path: Path):  # type: ignore[no-untyped-def]
    from app.store import ArtifactStore
    return ArtifactStore(tmp_path / "store")


# ---- result collection for tools/report.py (reports are produced only by the runner, E-02) ------------------
_RESULTS: dict[str, dict[str, Any]] = {}


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    for it in items:
        _RESULTS[it.nodeid] = {
            "tids": sorted({m.args[0] for m in it.iter_markers("tid")}),
            "reqs": sorted({m.args[0] for m in it.iter_markers("req")}),
            "outcome": "not_run", "duration": 0.0}


def pytest_runtest_logreport(report: pytest.TestReport) -> None:
    r = _RESULTS.setdefault(report.nodeid, {"tids": [], "reqs": [], "outcome": "not_run", "duration": 0.0})
    r["duration"] += report.duration
    if report.when == "call" or report.outcome in ("failed", "skipped"):
        if report.outcome == "failed" or r["outcome"] in ("not_run", "passed"):
            r["outcome"] = report.outcome
        if report.outcome == "failed":
            r["longrepr"] = str(report.longrepr)[-2000:]


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:
    import os
    out = os.environ.get("CIRA_RESULTS")
    if out:
        Path(out).write_text(json.dumps({"exitstatus": int(exitstatus), "tests": _RESULTS}, indent=1, sort_keys=True),
                             encoding="utf-8")
