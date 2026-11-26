#!/usr/bin/env python3
"""TX11 — operator / Σ lint (K-32). No comparison or match on OperatorRef.symbol/.code/.namespace or
SigmaRef.sigma_id outside app/syntx_adapter/registry.py and tests. Attribute-based, not literal-based.

`.symbol`, `.namespace`, `.sigma_id` are flagged on any object; `.code` only when the receiver expression
names an operator reference (contains 'operator', 'op_ref', 'opref' or ends in 'ref'), because ErrorRecord.code
is an unrelated contract field.
"""

from __future__ import annotations

import ast
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {ROOT / "backend/app/syntx_adapter/registry.py"}
ALWAYS = {"symbol", "namespace", "sigma_id"}
OPREF = re.compile(r"(operator|op_ref|opref|ref$)", re.I)


def _flag_attr(node: ast.AST) -> str | None:
    for sub in ast.walk(node):
        if isinstance(sub, ast.Attribute):
            if sub.attr in ALWAYS:
                return sub.attr
            if sub.attr == "code" and OPREF.search(ast.unparse(sub.value)):
                return "code"
    return None


def scan_file(path: Path) -> list[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"), str(path))
    out = []
    for node in ast.walk(tree):
        hit = None
        if isinstance(node, ast.Compare):
            hit = _flag_attr(node)
        elif isinstance(node, ast.Match):
            hit = _flag_attr(node.subject)
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and \
                node.func.attr in ("startswith", "endswith", "index", "find"):
            hit = _flag_attr(node.func.value)
        if hit:
            out.append(f"{path.relative_to(ROOT)}:{getattr(node, 'lineno', 0)}: comparison on .{hit}")
    return out


def scan(paths: list[Path]) -> list[str]:
    out: list[str] = []
    for base in paths:
        for p in sorted(base.rglob("*.py")) if base.is_dir() else [base]:
            if p in ALLOWED or "tests" in p.parts:
                continue
            out.extend(scan_file(p))
    return out


if __name__ == "__main__":
    findings = scan([ROOT / "backend/app", ROOT / "tools"])
    for f in findings:
        print(f)
    print(f"lint_operators: {len(findings)} finding(s)")
    raise SystemExit(1 if findings else 0)
