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
        sp_ = c.post("/experiments", json={**BASE, "label": "Baseline (sparse schedule)",
                                           "sweep_schedule": {"mode": "EXPLICIT", "ticks": [1, 3, 5]}}).json()["experiment_id"]
        cmp_ = c.post("/comparisons", json={"baseline_experiment_id": b, "recovery_experiment_id": r}).json()
        cid = cmp_["comparison"]["comparison_key"]
        index["experiments"] = {"baseline": b, "recovery": r, "blocked": k, "sparse": sp_}
        index["comparison"] = cid
        # URLs exactly as frontend/src/access/endpoints.ts builds them (parameter set and spelling; the test
        # fetch mock compares order-insensitively). Keep in step with ep.* (TX15).
        for url in ("/health", "/scenarios", "/experiments", "/comparisons", f"/comparisons/{cid}", "/fields"):
            get(url)
        for e in (b, r, k, sp_):
            get(f"/experiments/{e}")
            get(f"/experiments/{e}/topology")
            get(f"/fields?experiment_id={e}")
            get(f"/comparisons?experiment_id={e}")
            get(f"/experiments/{e}/events")
            get(f"/experiments/{e}/metrics?aggregation=POOLED")
            get(f"/experiments/{e}/metrics?aggregation=TIME_MEAN_EXPLICIT")
            attempts = {t: [0] for t in range(6)}
            if e == b:
                attempts[5] = [0, 1]
            for t in range(6):
                get(f"/experiments/{e}/states?tick={t}")
                get(f"/experiments/{e}/observations?tick={t}")
                get(f"/experiments/{e}/metrics?aggregation=PER_TICK&tick={t}")
                for agg in ("POOLED", "TIME_MEAN_EXPLICIT"):
                    get(f"/experiments/{e}/metrics?aggregation={agg}&to_tick={t}")
                get(f"/fields?experiment_id={e}&tick={t}")
                get(f"/experiments/{e}/events?from=0&to={t}")
                for sp in ("A", "O", "R"):
                    get(f"/experiments/{e}/governance?tick={t}&space={sp}")
                for a in attempts[t]:
                    get(f"/experiments/{e}/results?tick={t}&attempt={a}")
                    for d in ("forward", "inverse", "merged"):
                        get(f"/experiments/{e}/results?tick={t}&attempt={a}&direction={d}")
                    for d in ("fwd", "inv"):
                        get(f"/experiments/{e}/results/sweep:{d}:t{t}:a{a}/trace")
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
