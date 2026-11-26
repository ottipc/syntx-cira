"""Fixture catalog: discovers synthetic definitions by ID and resolves symbolic `$fixture` references to
content-addressed ArtifactRefs. Everything here is TEST DATA (is_fixture), never engine output."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from ..contracts.common import ArtifactRef, load, make_ref
from ..contracts.registry import ARTIFACT_TYPES
from ..core.errors import CiraError, ErrorCode

ROOT = Path(__file__).resolve().parents[3]
FIXTURES = ROOT / "synthetic_fixtures"
META = {"is_fixture", "for_config", "note"}
DIRS: dict[str, tuple[str, str]] = {
    "topology_definition": ("f01_topology", "topology_id"),
    "governance_definition": ("f02_governance", "governance_id"),
    "scenario_definition": ("f03_scenarios", "scenario_id"),
    "consistency_annotation_set": ("f03_annotations", "scenario_ref"),
    "observation_config": ("f04_observation_configs", "config_id"),
    "target_definition": ("f04_targets", "target_id"),
    "weight_set": ("f06_weight_sets", "weight_set_id"),
    "operator_registry": ("f05_registries", "registry_id"),
}


def _strip(t: str, raw: dict[str, Any]) -> dict[str, Any]:
    fields = ARTIFACT_TYPES[t].model_fields
    return {k: v for k, v in raw.items() if not (k in META and k not in fields)}


def _resolve(obj: Any) -> Any:
    if isinstance(obj, dict):
        if set(obj) == {"$fixture", "type"}:
            return ref_of_file(obj["$fixture"], obj["type"]).model_dump(mode="json")
        return {k: _resolve(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_resolve(v) for v in obj]
    return obj


@lru_cache(maxsize=None)
def load_file(rel: str, artifact_type: str) -> BaseModel:
    raw = json.loads((FIXTURES / rel).read_text(encoding="utf-8"))
    return load(ARTIFACT_TYPES[artifact_type], _resolve(_strip(artifact_type, raw)))


def ref_of_file(rel: str, artifact_type: str) -> ArtifactRef:
    return make_ref(artifact_type, load_file(rel, artifact_type))


@lru_cache(maxsize=None)
def index() -> dict[tuple[str, str], tuple[str, dict[str, Any]]]:
    out: dict[tuple[str, str], tuple[str, dict[str, Any]]] = {}
    for t, (d, key) in DIRS.items():
        for p in sorted((FIXTURES / d).glob("*.json")):
            raw = json.loads(p.read_text(encoding="utf-8"))
            ident = p.stem if key == "scenario_ref" else raw[key]
            out[(t, ident)] = (str(p.relative_to(FIXTURES)), raw)
    return out


def get(artifact_type: str, ident: str) -> BaseModel:
    hit = index().get((artifact_type, ident))
    if hit is None:
        raise CiraError(ErrorCode.NOT_FOUND, f"{artifact_type} {ident} not found", subjects=(ident,))
    return load_file(hit[0], artifact_type)


def annotations_for(scenario_id: str) -> BaseModel | None:
    for (t, _), (rel, raw) in index().items():
        if t == "consistency_annotation_set":
            m = load_file(rel, t)
            if m.scenario_ref == make_ref("scenario_definition", get("scenario_definition", scenario_id)):  # type: ignore[attr-defined]
                return m
    return None


def scenarios() -> list[tuple[str, dict[str, Any]]]:
    return [(i, raw) for (t, i), (_, raw) in sorted(index().items()) if t == "scenario_definition"]


def configs_for(scenario_id: str) -> list[str]:
    return sorted(i for (t, i) in index() if t == "observation_config")


def targets_for(config_id: str) -> list[str]:
    return sorted(i for (t, i), (_, raw) in index().items() if t == "target_definition"
                  and raw.get("for_config", config_id) == config_id)
