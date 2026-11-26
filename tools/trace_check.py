#!/usr/bin/env python3
"""TX12 — trace_check: REQ ↔ components ↔ tests ↔ ADR markers (15.6, 15.9). Exit 1 on any finding."""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import ROOT, min_phase, registry, test_markers  # noqa: E402

EXPECTED_TESTS = [f"T{i:02d}" for i in range(1, 13)] + ["T04b"] + [f"TX{i:02d}" for i in range(1, 34)]


def check() -> list[str]:
    reg = registry()
    out: list[str] = []
    cur = int(reg["current_phase"])
    reqs = reg["requirements"]
    ids = [r["id"] for r in reqs]
    if ids != [f"REQ-{i:03d}" for i in range(1, 82)]:
        out.append("registry: REQ-001..REQ-081 not complete or not ordered")
    cat = {t["id"]: t for t in reg["tests"]}
    if sorted(cat) != sorted(EXPECTED_TESTS):
        out.append(f"registry: test catalog mismatch {sorted(set(EXPECTED_TESTS) ^ set(cat))}")
    ak = {a["id"] for a in reg["acceptance"]}
    marks = test_markers()
    used_tid = {t for m in marks.values() for t in m["tid"]}
    used_req = {r for m in marks.values() for r in m["req"]}
    for t in sorted(used_tid - set(cat)):
        out.append(f"tests: marker tid({t}) not in catalog")
    for r in sorted(used_req - set(ids)):
        out.append(f"tests: marker req({r}) not in registry")
    gates = reg.get("phase_tests", {})
    gate = {x for p in range(1, cur + 1) for x in gates.get(f"{p:02d}", [])}
    for p in range(1, cur + 1):
        for tid in gates.get(f"{p:02d}", []):
            if tid not in cat:
                out.append(f"phase_tests {p:02d}: {tid} unknown")
            elif tid not in used_tid:
                out.append(f"tests: {tid} (gate {p:02d}) has no implementing test")
    for r in reqs:
        for t in r["tests"]:
            if t not in cat and t not in ak:
                out.append(f"{r['id']}: test reference {t} unknown")
        ph = min_phase(r["phase"])
        if r["kind"] != "product" or ph is None or ph > cur:
            continue
        in_gate = [t for t in r["tests"] if t in gate]
        if r["id"] in used_req or any(t in used_tid for t in in_gate):
            continue
        if in_gate or not r["tests"]:
            out.append(f"{r['id']}: no test of a passed or current gate covers it")
    adr_dir = ROOT / "docs" / "adr"
    listed = {a["id"] for a in reg.get("adr", [])}
    files = {p.name.split("-")[0] + "-" + p.name.split("-")[1] for p in adr_dir.glob("ADR-*.md")}
    for a in sorted(listed ^ files):
        out.append(f"adr: {a} listed/file mismatch")
    for p in sorted(adr_dir.glob("ADR-*.md")):
        if not re.search(r"^Status: (ACCEPTED|PROPOSED|SUPERSEDED)", p.read_text(encoding="utf-8"), re.M):
            out.append(f"adr: {p.name} without Status line")
    code = sorted((ROOT / "backend" / "app").rglob("*.py")) + sorted((ROOT / "frontend" / "src").rglob("*.ts*"))
    for p in code:
        for m in re.findall(r"ADR-\d{4}", p.read_text(encoding="utf-8")):
            if m not in files:
                out.append(f"{p.relative_to(ROOT)}: marker {m} without ADR file")
    return out


if __name__ == "__main__":
    f = check()
    for x in f:
        print(x)
    print(f"trace_check: {len(f)} finding(s)")
    raise SystemExit(1 if f else 0)
