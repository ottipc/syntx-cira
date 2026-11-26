"""Generate backend/.importlinter from contracts/coupling_matrix.json (15.6, E-10). --check for drift."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backend" / ".importlinter"


def render() -> str:
    m = json.loads((ROOT / "contracts" / "coupling_matrix.json").read_text(encoding="utf-8"))
    lines = ["# GENERATED from contracts/coupling_matrix.json by scripts/gen_importlinter.py — do not edit (E-10)",
             "[importlinter]", "root_package = app", "include_external_packages = False", ""]
    for i, (src, rule) in enumerate(sorted(m["import_rules"].items())):
        lines += [f"[importlinter:contract:{i:02d}-{src.replace('app.', '').replace('.', '-')}]",
                  f"name = {src} must not import {', '.join(rule['forbidden'])}",
                  "type = forbidden", f"source_modules = {src}",
                  "forbidden_modules =", *[f"    {x}" for x in sorted(rule["forbidden"])], ""]
    return "\n".join(lines)


if __name__ == "__main__":
    text = render()
    if "--check" in sys.argv:
        ok = OUT.exists() and OUT.read_text(encoding="utf-8") == text
        print("importlinter: in sync" if ok else "importlinter: DRIFT")
        raise SystemExit(0 if ok else 1)
    OUT.write_text(text, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")
