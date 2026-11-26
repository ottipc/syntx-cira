"""Export JSON Schemas from the Pydantic SSOT (P12, U-12, TX02). Generated files are never hand-edited (E-10).

Writes contracts/schemas/cira.contracts.schema.json (bundled) and contracts/schemas/<type>.schema.json.
Usage: export_schemas.py [--out DIR] [--check]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from pydantic import BaseModel  # noqa: E402
from pydantic.json_schema import models_json_schema  # noqa: E402

from app.contracts import f01, f02, f03, f04_record, f06, f07  # noqa: E402
from app.contracts.common import ErrorRecord  # noqa: E402
from app.contracts.registry import ARTIFACT_TYPES, CONTRACT_VERSION, ENVELOPES, ExperimentBundle  # noqa: E402

EXTRA: list[type[BaseModel]] = [
    ExperimentBundle, ErrorRecord, f01.TopologyProjectionBody, f02.RuleView, f03.ExperimentView,
    f04_record.ObservationProjectionBody, f06.MetricDefinition, f06.MetricResult, f07.ProjectionHeader,
    f07.QueryEcho, f07.ExperimentSession, f07.ViewState,
]


def dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def generate() -> dict[str, str]:
    models: list[type[BaseModel]] = list(ARTIFACT_TYPES.values()) + list(ENVELOPES.values()) + EXTRA
    _, bundled = models_json_schema([(m, "validation") for m in models], ref_template="#/$defs/{model}",
                                    title="CIRA contracts")
    bundled = {"$schema": "https://json-schema.org/draft/2020-12/schema",
               "$id": f"https://syntx.invalid/cira/contracts/{CONTRACT_VERSION}",
               "title": f"CIRA contracts {CONTRACT_VERSION}",
               "x-artifact-types": sorted(ARTIFACT_TYPES),
               "x-envelopes": {t: ENVELOPES[t].__name__ for t in sorted(ENVELOPES)},
               **bundled}
    files = {"cira.contracts.schema.json": dumps(bundled)}
    for t, m in sorted(ARTIFACT_TYPES.items()):
        s = m.model_json_schema(mode="validation")
        s["$id"] = f"cira.{t}/{CONTRACT_VERSION}"
        files[f"{t}.schema.json"] = dumps(s)
    return files


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "contracts" / "schemas"))
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    out = Path(a.out)
    files = generate()
    if a.check:
        bad = [n for n, c in files.items() if not (out / n).exists() or (out / n).read_text(encoding="utf-8") != c]
        extra = sorted(p.name for p in out.glob("*.schema.json") if p.name not in files)
        if bad or extra:
            print("schema drift:", bad, extra)
            return 1
        return 0
    out.mkdir(parents=True, exist_ok=True)
    for p in out.glob("*.schema.json"):
        if p.name not in files:
            p.unlink()
    for n, c in files.items():
        (out / n).write_text(c, encoding="utf-8")
    print(f"wrote {len(files)} schema files to {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
