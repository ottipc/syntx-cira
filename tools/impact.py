#!/usr/bin/env python3
"""Impact set (15.5): changed files → affected modules, contract types, fields, REQs and tests.

Four graphs: imports (AST), contract types (registry), coupling matrix, evidence (registry.yaml).
usage: impact.py [FILE ...]   (default: files changed against HEAD)
"""

from __future__ import annotations

import ast
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import ROOT, registry, test_markers  # noqa: E402

APP = ROOT / "backend" / "app"


def module_of(p: Path) -> str:
    rel = p.relative_to(ROOT / "backend").with_suffix("")
    parts = list(rel.parts)
    if parts[-1] == "__init__":
        parts = parts[:-1]
    return ".".join(parts)


def import_graph() -> dict[str, set[str]]:
    g: dict[str, set[str]] = {}
    for p in sorted((ROOT / "backend").rglob("*.py")):
        if "node_modules" in p.parts:
            continue
        mod = module_of(p)
        deps: set[str] = set()
        tree = ast.parse(p.read_text(encoding="utf-8"))
        pkg = mod if p.name == "__init__.py" else mod.rsplit(".", 1)[0]
        for n in ast.walk(tree):
            if isinstance(n, ast.ImportFrom):
                base = n.module or ""
                if n.level:
                    up = pkg.split(".")[: len(pkg.split(".")) - (n.level - 1)]
                    base = ".".join(up + ([n.module] if n.module else []))
                deps.add(base)
                for a in n.names:
                    deps.add(f"{base}.{a.name}")
            elif isinstance(n, ast.Import):
                deps.update(a.name for a in n.names)
        g[mod] = {d for d in deps if d.startswith(("app", "tests"))}
    return g


def impacted(files: list[str]) -> dict[str, list[str]]:
    g = import_graph()
    changed = {module_of(ROOT / f) for f in files if f.endswith(".py") and (ROOT / f).exists()
               and (ROOT / f).is_relative_to(ROOT / "backend")}
    rev: dict[str, set[str]] = {}
    for m, ds in g.items():
        for d in ds:
            rev.setdefault(d, set()).add(m)
    seen = set(changed)
    todo = list(changed)
    while todo:
        x = todo.pop()
        for y in rev.get(x, set()):
            if y not in seen:
                seen.add(y)
                todo.append(y)
    tests = sorted(m for m in seen if m.startswith("tests."))
    reg = registry()
    reqs = sorted({r["id"] for r in reg["requirements"] for c in r["components"] for f in files
                   if f.startswith(c)})
    marks = test_markers()
    tids = sorted({t for k, v in marks.items() if any(k.startswith(tm.replace(".", "/")) for tm in tests) for t in v["tid"]})
    matrix = json.loads((ROOT / "contracts/coupling_matrix.json").read_text())
    fields = sorted({f for f, pkg in matrix["field_packages"].items() if any(m.startswith(pkg) for m in seen)})
    if any(f.startswith(("contracts/", "backend/app/contracts/")) for f in files):
        tids = sorted(set(tids) | {"T02", "TX01", "TX02", "TX04", "TX14", "TX17"})
    return {"changed_modules": sorted(changed), "impacted_modules": sorted(seen - set(tests)), "tests": tests,
            "test_ids": tids, "requirements": reqs, "fields": fields}


if __name__ == "__main__":
    files = sys.argv[1:]
    if not files:
        out = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
        files = [l[3:].strip() for l in out.splitlines()]
    print(json.dumps(impacted(files), indent=1))
