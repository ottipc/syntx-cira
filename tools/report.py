#!/usr/bin/env python3
"""Machine test report (15.12 condition 3, AK-14). Only this runner writes docs/test-reports (E-02).

usage: report.py --phase 01 [--out PATH] [--no-write]
Runs every suite of the phase and all earlier phases, records actual outcomes, computes the gate and a hash.
Wall-clock time appears only in the report (K-52).
"""

from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import REPORTS, ROOT, registry  # noqa: E402

PY = sys.executable
BACK = ROOT / "backend"
FRONT = ROOT / "frontend"


def sh(cmd: list[str] | str, cwd: Path = ROOT, env: dict[str, str] | None = None, timeout: int = 1800
       ) -> tuple[int, str, float]:
    t0 = time.monotonic()
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, env={**os.environ, **(env or {})},
                           timeout=timeout, shell=isinstance(cmd, str))
        return p.returncode, (p.stdout + p.stderr)[-6000:], time.monotonic() - t0
    except FileNotFoundError as e:
        return 127, str(e), time.monotonic() - t0
    except subprocess.TimeoutExpired as e:
        return 124, f"timeout: {e}", time.monotonic() - t0


def canonical_hash(obj: Any) -> str:
    data = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    return "sha256:" + hashlib.sha256(data).hexdigest()


def environment() -> dict[str, Any]:
    def v(cmd: list[str]) -> str | None:
        rc, out, _ = sh(cmd)
        return out.strip().splitlines()[0] if rc == 0 and out.strip() else None
    chrome = os.environ.get("CHROME_PATH") or shutil.which("chrome") or shutil.which("google-chrome") or \
        shutil.which("chromium")
    docker_rc, docker_out, _ = sh(["docker", "info", "--format", "{{.ServerVersion}}"])
    return {"python": platform.python_version(), "node": v(["node", "--version"]), "npm": v(["npm", "--version"]),
            "os": f"{platform.system()} {platform.release()}",
            "docker": {"cli": shutil.which("docker") is not None,
                       "daemon": docker_out.strip() if docker_rc == 0 else None,
                       "note": None if docker_rc == 0 else "daemon not reachable (DEP-07a)"},
            "browser": {"path": chrome, "version": v([chrome, "--version"]) if chrome else None},
            "fonts": sorted(p.name for p in (FRONT / "node_modules" / "@fontsource").glob("*"))
            if (FRONT / "node_modules" / "@fontsource").exists() else []}


def suites_for(phase: int) -> list[tuple[str, list[str] | str, Path, dict[str, str]]]:
    s: list[tuple[str, list[str] | str, Path, dict[str, str]]] = [
        ("mypy", ["mypy"], BACK, {}),
        ("import-linter", ["lint-imports", "--config", ".importlinter"], BACK, {}),
        ("drift:schemas", [PY, "scripts/export_schemas.py", "--check"], BACK, {}),
        ("drift:importlinter", [PY, "scripts/gen_importlinter.py", "--check"], BACK, {}),
        ("drift:tx14-bundle", [PY, "-c", "import sys,runpy;sys.argv=['x'];"
                               "import importlib.util as u;s=u.spec_from_file_location('b','scripts/build_tx14_bundle.py');"
                               "m=u.module_from_spec(s);s.loader.exec_module(m);import tempfile,pathlib;"
                               "p=pathlib.Path(tempfile.mkdtemp())/'b.json';m.build(p);"
                               "sys.exit(0 if p.read_bytes()==m.OUT.read_bytes() else 1)"], BACK, {}),
        ("trace_check", [PY, "tools/trace_check.py"], ROOT, {}),
        ("lint_operators", [PY, "tools/lint_operators.py"], ROOT, {}),
        ("fixture_lint", [PY, "tools/fixture_lint.py"], ROOT, {}),
    ]
    if phase >= 3:
        s.insert(3, ("drift:snapshots", [PY, "scripts/gen_snapshots.py", "--check"], BACK, {}))
    if phase >= 4:
        s += [("drift:semiontics", [PY, "tools/gen_semiontics.py", "--check"], ROOT, {}),
              ("drift:ts-contracts", ["npm", "run", "-s", "gen:contracts:check"], FRONT, {}),
              ("drift:depcruise-rules", ["node", "scripts/gen-depcruise.mjs", "--check"], FRONT, {}),
              ("tsc", ["npm", "run", "-s", "typecheck"], FRONT, {}),
              ("frontend-lint", ["npm", "run", "-s", "lint:arch"], FRONT, {}),
              ("vitest", ["npm", "run", "-s", "test:report"], FRONT, {})]
    return s


def run(phase: int, out: Path | None) -> dict[str, Any]:
    started = _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds")
    reg = registry()
    suites: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory() as tmp:
        res_path = Path(tmp) / "results.json"
        rc, outp, dur = sh([PY, "-m", "pytest", "-p", "no:cacheprovider", "-q"], BACK, {"CIRA_RESULTS": str(res_path)})
        results = json.loads(res_path.read_text()) if res_path.exists() else {"tests": {}}
        suites.append({"name": "pytest", "status": "passed" if rc == 0 else "failed", "returncode": rc,
                       "duration_s": round(dur, 2), "tail": outp[-1500:]})
        tests: dict[str, Any] = results["tests"]
        icov: dict[str, float] = {}
        if phase >= 3 and (BACK / "tests" / "integration").exists():
            cov = Path(tmp) / ".coverage"
            rc2, out2, d2 = sh([PY, "-m", "coverage", "run", f"--data-file={cov}", "--source=app", "-m", "pytest",
                                "-p", "no:cacheprovider", "-q", "tests/integration"], BACK)
            sh([PY, "-m", "coverage", "json", f"--data-file={cov}", "-o", str(Path(tmp) / "cov.json")], BACK)
            cj = Path(tmp) / "cov.json"
            if cj.exists():
                for f, d in json.loads(cj.read_text())["files"].items():
                    icov["backend/" + f] = d["summary"]["percent_covered"]
            suites.append({"name": "integration-coverage", "status": "passed" if rc2 == 0 else "failed",
                           "returncode": rc2, "duration_s": round(d2, 2), "tail": out2[-800:]})
    for name, cmd, cwd, env in suites_for(phase):
        rc, outp, dur = sh(cmd, cwd, env)
        suites.append({"name": name, "status": "passed" if rc == 0 else "failed", "returncode": rc,
                       "duration_s": round(dur, 2), "tail": outp[-1500:]})
    fe = FRONT / "test-results" / "vitest.json"
    if phase >= 4 and fe.exists():
        for k, v in json.loads(fe.read_text()).get("tests", {}).items():
            tests[f"frontend::{k}"] = v
    for k, t in sorted(tests.items()):
        if t["outcome"] != "passed":
            failures.append({"test": k, "outcome": t["outcome"], "detail": t.get("longrepr", "")[-800:]})
    for s in suites:
        if s["status"] != "passed":
            failures.append({"suite": s["name"], "detail": s["tail"][-800:]})
    totals = {k: sum(1 for t in tests.values() if t["outcome"] == k) for k in ("passed", "failed", "skipped")}
    totals["not_run"] = sum(1 for t in tests.values() if t["outcome"] == "not_run")
    gate_tids = [x for p in range(1, phase + 1) for x in reg["phase_tests"].get(f"{p:02d}", [])]
    by_tid: dict[str, list[str]] = {}
    for t in tests.values():
        for x in t["tids"]:
            by_tid.setdefault(x, []).append(t["outcome"])
    gate_tests = {x: ("passed" if by_tid.get(x) and all(o == "passed" for o in by_tid[x]) else
                      ("missing" if not by_tid.get(x) else "failed")) for x in gate_tids}
    rc_git, commit, _ = sh(["git", "rev-parse", "--short", "HEAD"])
    rc_dirty, dirty, _ = sh(["git", "status", "--porcelain"])
    report: dict[str, Any] = {
        "report_id": f"phase-{phase:02d}", "phase": f"{phase:02d}",
        "commit": (commit.strip() if rc_git == 0 else "none") + ("+dirty" if dirty.strip() else ""),
        "started": started, "environment": environment(), "suites": suites, "failures": failures,
        "totals": totals, "gate_tests": gate_tests, "tests": tests, "integration_coverage": icov,
        "screenshots": [],
    }
    from status import coverage_summary, req_states
    states = req_states(reg, report)
    summ = coverage_summary(states)
    report["req_coverage"] = {"verified": summ.get("VERIFIED", []), "integrated": summ.get("INTEGRATED", []),
                              "implemented": summ.get("IMPLEMENTED", []), "blocked_dep": summ.get("BLOCKED_DEP", []),
                              "provisional": summ.get("PROVISIONAL", []), "missing": summ.get("DESIGNED", []),
                              "process": summ.get("PROCESS", [])}
    from ak import evaluate_ak
    report["ak_status"] = evaluate_ak(reg, report, phase)
    corr = (ROOT / "docs" / "corrections.md").read_text(encoding="utf-8") if (ROOT / "docs/corrections.md").exists() else ""
    open_f12 = [l for l in corr.splitlines() if l.startswith("|") and "| OPEN |" in l and ("| F1 |" in l or "| F2 |" in l)]
    report["gate"] = {"passed": False, "conditions": {
        "sync_no_drift": all(s["status"] == "passed" for s in suites if s["name"].startswith("drift:")),
        "verify_0_errors_0_skips": totals["failed"] == 0 and totals["skipped"] == 0 and totals["not_run"] == 0
        and all(s["status"] == "passed" for s in suites),
        "gate_tests_present_and_green": all(v == "passed" for v in gate_tests.values()),
        "report_written": out is not None,
        "no_open_F1_F2": not open_f12}}
    report["gate"]["passed"] = all(report["gate"]["conditions"].values())
    report["hash"] = canonical_hash({k: v for k, v in report.items() if k != "hash"})
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", required=True, type=int)
    ap.add_argument("--out")
    ap.add_argument("--no-write", action="store_true")
    a = ap.parse_args()
    out = None if a.no_write else Path(a.out) if a.out else REPORTS / f"phase-{a.phase:02d}.json"
    r = run(a.phase, out)
    print(json.dumps({"phase": r["phase"], "gate": r["gate"], "totals": r["totals"], "hash": r["hash"],
                      "failures": [f.get("test") or f.get("suite") for f in r["failures"]]}, indent=1))
    raise SystemExit(0 if r["gate"]["passed"] else 1)
