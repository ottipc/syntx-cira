"""FieldReader / FieldWriter — runtime capability guard from contracts/coupling_matrix.json (L3, TX04)."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from ..contracts.common import FieldId, Provenance
from ..contracts.registry import EnvelopeBase
from .cas import ArtifactStore

MATRIX_PATH = Path(__file__).resolve().parents[3] / "contracts" / "coupling_matrix.json"


@lru_cache(maxsize=1)
def capabilities() -> dict[str, dict[str, frozenset[str]]]:
    raw = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
    return {t: {"W": frozenset(c["W"]), "R": frozenset(c["R"]) | frozenset(c["W"])}
            for t, c in raw["capabilities"].items()}


class AccessViolation(PermissionError):
    """ACCESS_VIOLATION: field accessed an artifact type outside its capability."""


def _check(field: FieldId, artifact_type: str, op: str) -> None:
    caps = capabilities().get(artifact_type)
    if caps is None or field.value not in caps[op]:
        raise AccessViolation(f"ACCESS_VIOLATION: {field.value} may not {op} {artifact_type}")


class FieldReader:
    """Read access bound to one field. The orchestrator uses the reader of the field it acts for (K-48)."""

    def __init__(self, store: ArtifactStore, field: FieldId, experiment_id: str | None = None) -> None:
        self._store = store
        self.field = field
        self.experiment_id = experiment_id

    def get(self, artifact_id: str, artifact_type: str) -> BaseModel:
        _check(self.field, artifact_type, "R")
        self._store.log_access(self.experiment_id, self.field, artifact_type, "R")
        return self._store.load_payload(artifact_id, artifact_type)

    def latest(self, artifact_type: str, logical_key: str, experiment_id: str | None = None
               ) -> tuple[dict[str, Any], BaseModel] | None:
        _check(self.field, artifact_type, "R")
        exp = experiment_id or self.experiment_id
        assert exp is not None
        e = self._store.latest(exp, artifact_type, logical_key)
        if e is None:
            return None
        self._store.log_access(self.experiment_id, self.field, artifact_type, "R")
        return e, self._store.load_payload(e["artifact_id"], artifact_type)

    def entries(self, artifact_type: str, experiment_id: str | None = None) -> list[dict[str, Any]]:
        _check(self.field, artifact_type, "R")
        exp = experiment_id or self.experiment_id
        assert exp is not None
        return self._store.entries(exp, artifact_type)


class FieldWriter:
    def __init__(self, store: ArtifactStore, field: FieldId, experiment_id: str | None,
                 producer_id: str, producer_version: str = "1.0.2") -> None:
        self._store = store
        self.field = field
        self.experiment_id = experiment_id
        self.producer_id = producer_id
        self.producer_version = producer_version

    def put(self, artifact_type: str, payload: BaseModel, logical_key: str, tick: int | None,
            source_refs: tuple[Any, ...] = (), data_origin: str = "SYNTHETIC") -> EnvelopeBase:
        _check(self.field, artifact_type, "W")
        self._store.log_access(self.experiment_id, self.field, artifact_type, "W")
        prov = Provenance.model_validate_json(json.dumps({
            "source_field": self.field.value,
            "source_refs": [r.model_dump(mode="json") for r in source_refs],
            "producer_id": self.producer_id, "producer_version": self.producer_version,
            "data_origin": data_origin}))
        return self._store.put(experiment_id=self.experiment_id, artifact_type=artifact_type, payload=payload,
                               logical_key=logical_key, tick=tick, provenance=prov)
