#!/usr/bin/env python3
"""TX18 — observed coupling graph ⊆ matrix, no dead edges (K-48). Reads the access log of the store index."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def audit(index_records: list[dict[str, Any]], matrix: dict[str, Any] | None = None) -> dict[str, Any]:
    m = matrix or json.loads((ROOT / "contracts/coupling_matrix.json").read_text(encoding="utf-8"))
    caps = m["capabilities"]
    writer = {t: c["W"][0] for t, c in caps.items()}
    observed: set[tuple[str, str]] = set()
    violations = []
    for r in index_records:
        if r.get("kind") != "access":
            continue
        t, f, op = r["artifact_type"], r["field"], r["op"]
        if f not in caps[t]["W" if op == "W" else "R"] and not (op == "R" and f in caps[t]["W"]):
            violations.append(r)
        if op == "R" and writer[t] != f:
            observed.add((writer[t], f))
    allowed = {(a, b) for a, b, _ in m["couplings"]}
    outside = sorted(observed - allowed)
    dead = sorted(allowed - observed)
    return {"observed": sorted(observed), "outside_matrix": outside, "dead_edges": dead, "violations": violations}


if __name__ == "__main__":
    recs: list[dict[str, Any]] = []
    for p in sys.argv[1:]:
        recs += [json.loads(l) for l in Path(p).read_text(encoding="utf-8").splitlines() if l]
    print(json.dumps(audit(recs), indent=1))
