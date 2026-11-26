"""Shared helpers for tools/ (registry access, marker extraction, phase parsing)."""

from __future__ import annotations

import ast
import json
import re
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "docs" / "traceability" / "registry.yaml"
TESTS = ROOT / "backend" / "tests"
REPORTS = ROOT / "docs" / "test-reports"


def registry() -> dict[str, Any]:
    return yaml.safe_load(REGISTRY.read_text(encoding="utf-8"))  # type: ignore[no-any-return]


def min_phase(text: str) -> int | None:
    nums = [int(x) for x in re.findall(r"\b0(\d)\b", str(text))]
    if "alle" in str(text):
        return 1
    return min(nums) if nums else None


def _marks(dec: ast.expr) -> list[tuple[str, str]]:
    out = []
    for node in ast.walk(dec):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in ("tid", "req") \
                and node.args and isinstance(node.args[0], ast.Constant):
            out.append((node.func.attr, str(node.args[0].value)))
    return out


def test_markers(root: Path = TESTS) -> dict[str, dict[str, set[str]]]:
    """{test_file::func: {'tid': {...}, 'req': {...}}} from decorators and module-level pytestmark."""
    res: dict[str, dict[str, set[str]]] = {}
    for p in sorted(root.rglob("test_*.py")):
        tree = ast.parse(p.read_text(encoding="utf-8"))
        module: list[tuple[str, str]] = []
        for node in tree.body:
            if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "pytestmark" for t in node.targets):
                module += _marks(node.value)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith("test_"):
                ms = list(module)
                for d in node.decorator_list:
                    ms += _marks(d)
                key = f"{p.relative_to(ROOT)}::{node.name}"
                res[key] = {"tid": {v for k, v in ms if k == "tid"}, "req": {v for k, v in ms if k == "req"}}
    return res


def latest_report() -> tuple[Path, dict[str, Any]] | None:
    reps = sorted(REPORTS.glob("phase-*.json"))
    if not reps:
        return None
    return reps[-1], json.loads(reps[-1].read_text(encoding="utf-8"))
