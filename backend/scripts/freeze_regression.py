"""T11 / AK-13 — freeze regression bundles (ADR-0006 Nr. 3). Writes only bundles that do not exist yet; never part of
make sync. A deliberate behaviour change needs a new case version (new file name) and an ADR.

usage: freeze_regression.py --freeze      write missing bundles
       freeze_regression.py --list        show cases and whether their bundle exists
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
DIR = ROOT / "synthetic_fixtures" / "bundles" / "regression"

from fastapi.testclient import TestClient  # noqa: E402

from app.api.main import create_app  # noqa: E402


def cases() -> list[dict[str, Any]]:
    return list(json.loads((DIR / "cases.json").read_text(encoding="utf-8"))["cases"])


def path_of(case: dict[str, Any]) -> Path:
    return DIR / f"{case['name']}.v{case['version']}.bundle.json"


def serialise(bundle: dict[str, Any]) -> str:
    return json.dumps(bundle, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"


def build(case: dict[str, Any], data_dir: Path) -> dict[str, Any]:
    c = TestClient(create_app(data_dir, background=False))
    r = c.post("/experiments", json=case["request"])
    assert r.status_code == 202, r.text
    e = r.json()["experiment_id"]
    out = c.get(f"/experiments/{e}/export")
    assert out.status_code == 200, out.text
    return dict(out.json())


def main() -> int:
    if "--list" in sys.argv:
        for cs in cases():
            print(f"{path_of(cs).name}: {'frozen' if path_of(cs).exists() else 'missing'}")
        return 0
    if "--freeze" not in sys.argv:
        print(__doc__)
        return 2
    for cs in cases():
        p = path_of(cs)
        if p.exists():
            print(f"{p.name}: exists, left unchanged")
            continue
        with tempfile.TemporaryDirectory() as tmp:
            p.write_text(serialise(build(cs, Path(tmp))), encoding="utf-8")
        print(f"{p.name}: frozen ({p.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
