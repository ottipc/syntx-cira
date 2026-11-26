#!/usr/bin/env python3
"""TX09 — fixture lint (REQ-080): no geodata, no real names, fixtures marked as fixtures.

AdapterDescriptor.is_fixture describes the adapter (a stub adapter is not a fixture adapter) and is exempt."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GEO_KEYS = {"lat", "lon", "lng", "latitude", "longitude", "geo", "geometry", "coordinates", "address", "street",
            "city", "postcode", "zip", "country", "region", "municipality", "gps"}
COORD = re.compile(r"-?\d{1,2}\.\d{3,}\s*[,;]\s*-?\d{1,3}\.\d{3,}")
# Real places / operators / infrastructure brands that must not appear in synthetic data.
REAL = re.compile(r"\b(Berlin|München|Munich|Hamburg|Köln|Frankfurt|Stuttgart|Dresden|Leipzig|Bundeswehr|Vattenfall|"
                  r"E\.ON|RWE|EnBW|Stadtwerke|Deutsche Bahn|DB Netz|Telekom|Vodafone|Siemens|Amprion|TenneT|"
                  r"50Hertz|TransnetBW|Gazprom|Nord Stream|NATO)\b", re.I)


def walk(obj: Any, path: str, out: list[str]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() in GEO_KEYS:
                out.append(f"{path}.{k}: geo key")
            if k == "is_fixture" and v is not True and ".adapter" not in path:
                out.append(f"{path}.{k}: fixture data must carry is_fixture = true")
            walk(v, f"{path}.{k}", out)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]", out)
    elif isinstance(obj, str):
        if COORD.search(obj):
            out.append(f"{path}: coordinate-like value")
        if REAL.search(obj):
            out.append(f"{path}: real name {REAL.search(obj).group(0)!r}")  # type: ignore[union-attr]


def lint(root: Path = ROOT / "synthetic_fixtures") -> list[str]:
    out: list[str] = []
    for p in sorted(root.rglob("*.json")):
        data = json.loads(p.read_text(encoding="utf-8"))
        rel = str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p)
        walk(data, rel, out)
        top_fixture = isinstance(data, dict) and ("fixture_id" in data or "scenario_id" in data)
        if top_fixture and data.get("is_fixture") is not True:
            out.append(f"{rel}: top-level fixture without is_fixture = true")
    return out


if __name__ == "__main__":
    f = lint()
    for x in f:
        print(x)
    print(f"fixture_lint: {len(f)} finding(s)")
    sys.exit(1 if f else 0)
