"""Projection snapshots (15.10 step 2, TX15, TX19): real backend answers for a fixed demo setup, written to
frontend/test/snapshots/. Frontend tests run only against these files. Generated — never edited (E-10).

usage: gen_snapshots.py [--check]
"""

from __future__ import annotations

import json
import re
import sys
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
OUT = ROOT / "frontend" / "test" / "snapshots"

from fastapi.testclient import TestClient  # noqa: E402

from app.api.main import create_app  # noqa: E402

BASE = {"scenario_id": "scn:fx_base", "observation_config_id": "ocfg:fx_partial", "target_definition_id": "tgt:fx",
        "label": "Baseline"}


def name_of(url: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", url).strip("_")[:180] + ".json"


def generate() -> dict[str, str]:
    files: dict[str, str] = {}
    index: dict[str, Any] = {"version": "1.0.2", "generated_by": "backend/scripts/gen_snapshots.py", "routes": {}}
    with tempfile.TemporaryDirectory() as tmp:
        c = TestClient(create_app(Path(tmp), background=False))

        def get(url: str) -> None:
            r = c.get(url)
            fn = name_of(url)
            files[fn] = json.dumps(r.json(), ensure_ascii=False, indent=1, sort_keys=True) + "\n"
            index["routes"][url] = {"file": fn, "status": r.status_code}

        b = c.post("/experiments", json=BASE).json()["experiment_id"]
        r = c.post("/experiments", json={**BASE, "scenario_id": "scn:fx_rec", "label": "Recovery"}).json()["experiment_id"]
        k = c.post("/experiments", json={**BASE, "adapter": "LOCAL", "label": "Baseline (no engine)"}).json()["experiment_id"]
        cmp_ = c.post("/comparisons", json={"baseline_experiment_id": b, "recovery_experiment_id": r}).json()
        cid = cmp_["comparison"]["comparison_key"]
        index["experiments"] = {"baseline": b, "recovery": r, "blocked": k}
        index["comparison"] = cid
        for url in ("/health", "/scenarios", "/experiments", f"/comparisons?experiment_id={b}", f"/comparisons/{cid}",
                    "/fields"):
            get(url)
        for e in (b, r, k):
            get(f"/experiments/{e}")
            get(f"/experiments/{e}/topology")
            get(f"/fields?experiment_id={e}")
            get(f"/experiments/{e}/events")
            get(f"/experiments/{e}/metrics")
            get(f"/experiments/{e}/metrics?aggregation=TIME_MEAN_EXPLICIT")
            get(f"/experiments/{e}/results")
            for t in range(6):
                get(f"/experiments/{e}/states?tick={t}")
                get(f"/experiments/{e}/observations?tick={t}")
                get(f"/experiments/{e}/results?tick={t}")
                get(f"/experiments/{e}/metrics?aggregation=PER_TICK&tick={t}")
                get(f"/experiments/{e}/metrics?to_tick={t}")
                get(f"/fields?experiment_id={e}&tick={t}")
                get(f"/experiments/{e}/events?from=0&to={t}")
                for sp in ("A", "O", "R"):
                    get(f"/experiments/{e}/governance?tick={t}&space={sp}")
                for d in ("forward", "inverse", "merged"):
                    get(f"/experiments/{e}/results?tick={t}&direction={d}")
                for d in ("fwd", "inv"):
                    get(f"/experiments/{e}/results/sweep:{d}:t{t}:a0/trace")
        get(f"/experiments/{b}/results?tick=5&attempt=1")
        get(f"/experiments/{b}/export")
    files["index.json"] = json.dumps(index, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    return files


def main() -> int:
    files = generate()
    if "--check" in sys.argv:
        have = {p.name for p in OUT.glob("*.json")}
        bad = [n for n, t in files.items() if not (OUT / n).exists() or (OUT / n).read_text(encoding="utf-8") != t]
        if bad or have - set(files):
            print("snapshot drift:", bad[:5], sorted(have - set(files))[:5])
            return 1
        print(f"snapshots: {len(files)} in sync")
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    for p in OUT.glob("*.json"):
        if p.name not in files:
            p.unlink()
    for n, t in files.items():
        (OUT / n).write_text(t, encoding="utf-8")
    print(f"wrote {len(files)} snapshots to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
