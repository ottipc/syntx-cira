#!/usr/bin/env python3
"""make resume (15.8): phase and unit, git state, fresh verify, difference to the last report, open items."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import ROOT, latest_report, registry  # noqa: E402


def main() -> int:
    reg = registry()
    print(f"phase: {reg['current_phase']}  gate_mode: {reg['gate_mode']}")
    nxt = ROOT / "docs" / "NEXT.md"
    if nxt.exists():
        print("--- NEXT.md ---\n" + nxt.read_text(encoding="utf-8").strip())
    print("--- git ---")
    print(subprocess.run(["git", "log", "--oneline", "-5"], cwd=ROOT, capture_output=True, text=True).stdout.strip())
    print(subprocess.run(["git", "status", "--short"], cwd=ROOT, capture_output=True, text=True).stdout.strip() or "clean")
    lr = latest_report()
    sys.path.insert(0, str(ROOT / "tools"))
    from report import run
    fresh = run(int(reg["current_phase"]), None)
    print("--- fresh verify ---")
    print(json.dumps({"totals": fresh["totals"], "gate": fresh["gate"]["conditions"],
                      "failures": [f.get("test") or f.get("suite") for f in fresh["failures"]]}, indent=1))
    if lr:
        old = lr[1]
        a = {k for k, t in old["tests"].items() if t["outcome"] == "passed"}
        b = {k for k, t in fresh["tests"].items() if t["outcome"] == "passed"}
        print(f"--- vs {lr[0].name} ({old['hash'][:19]}…): +{len(b - a)} passing, -{len(a - b)} no longer passing")
    for d in ("blocked", "change-requests"):
        items = sorted(p.name for p in (ROOT / "docs" / d).glob("*.md"))
        print(f"open {d}: {items or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
