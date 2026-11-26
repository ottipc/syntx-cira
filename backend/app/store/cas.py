"""CAS objects + per-experiment append-only index (K-04, K-35, K-39). Wall-clock only in the index."""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any, TypeVar

from pydantic import BaseModel

from ..contracts.common import ArtifactRef, FieldId, Provenance, StageEvent
from ..contracts.registry import ARTIFACT_TYPES, ENVELOPES, EnvelopeBase, schema_version
from ..core.canonical_json import canonical_bytes
from ..core.hashing import artifact_id as make_artifact_id
from ..core.hashing import content_hash

M = TypeVar("M", bound=BaseModel)


def payload_json(model: BaseModel) -> Any:
    return model.model_dump(mode="json", by_alias=True)


class ArtifactStore:
    """Raw store. Field code never uses it directly; it goes through FieldReader/FieldWriter."""

    def __init__(self, root: Path) -> None:
        self.root = Path(root)
        (self.root / "objects").mkdir(parents=True, exist_ok=True)
        (self.root / "experiments").mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self.memory_access: list[dict[str, Any]] = []  # projection reads (F07) — not persisted into experiment indices

    # ---- objects -------------------------------------------------------------------------
    def _obj_path(self, aid: str) -> Path:
        return self.root / "objects" / f"{aid.split(':', 1)[1]}.json"

    def _write_object(self, aid: str, artifact_type: str, payload: Any) -> None:
        p = self._obj_path(aid)
        data = canonical_bytes({"artifact_type": artifact_type, "payload": payload})
        if p.exists():
            if p.read_bytes() != data:
                raise RuntimeError(f"CAS collision for {aid}")
            return
        tmp = p.with_suffix(".tmp")
        tmp.write_bytes(data)
        tmp.replace(p)

    def read_object(self, aid: str) -> tuple[str, Any]:
        raw = json.loads(self._obj_path(aid).read_bytes())
        return raw["artifact_type"], raw["payload"]

    def has_object(self, aid: str) -> bool:
        return self._obj_path(aid).exists()

    # ---- index ---------------------------------------------------------------------------
    def _index_path(self, experiment_id: str) -> Path:
        d = self.root / "experiments" / experiment_id.replace(":", "_")
        d.mkdir(parents=True, exist_ok=True)
        return d / "index.jsonl"

    def _append(self, experiment_id: str, record: dict[str, Any]) -> None:
        record = dict(record, recorded_at=time.time())
        with self._lock, self._index_path(experiment_id).open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")

    def index(self, experiment_id: str) -> list[dict[str, Any]]:
        p = self._index_path(experiment_id)
        if not p.exists():
            return []
        return [json.loads(line) for line in p.read_text(encoding="utf-8").splitlines() if line]

    def experiments(self) -> list[str]:
        out = []
        for d in sorted((self.root / "experiments").iterdir()):
            if (d / "index.jsonl").exists():
                first = json.loads((d / "index.jsonl").read_text(encoding="utf-8").splitlines()[0])
                out.append(first["experiment_id"])
        return out

    # ---- envelopes -----------------------------------------------------------------------
    def put(self, *, experiment_id: str | None, artifact_type: str, payload: BaseModel, logical_key: str,
            tick: int | None, provenance: Provenance) -> EnvelopeBase:
        model_cls = ARTIFACT_TYPES[artifact_type]
        if not isinstance(payload, model_cls):
            raise TypeError(f"payload for {artifact_type} must be {model_cls.__name__}")
        pj = payload_json(payload)
        aid = make_artifact_id(artifact_type, pj)
        with self._lock:
            self._write_object(aid, artifact_type, pj)
            revision = 0
            if experiment_id is not None:
                same = [r for r in self.index(experiment_id) if r.get("kind") == "artifact"
                        and r["artifact_type"] == artifact_type and r["logical_key"] == logical_key]
                if same and same[-1]["artifact_id"] == aid:
                    revision = same[-1]["revision"]
                    return self.envelope(experiment_id, aid, artifact_type, logical_key, revision, tick,
                                         provenance, payload)
                revision = len(same)
            env = self.envelope(experiment_id, aid, artifact_type, logical_key, revision, tick, provenance,
                                payload)
            if experiment_id is not None:
                self._append(experiment_id, {
                    "kind": "artifact", "experiment_id": experiment_id, "artifact_id": aid,
                    "artifact_type": artifact_type, "logical_key": logical_key, "revision": revision,
                    "tick": tick, "content_hash": env.content_hash,
                    "provenance": provenance.model_dump(mode="json")})
            return env

    def envelope(self, experiment_id: str | None, aid: str, artifact_type: str, logical_key: str,
                 revision: int, tick: int | None, provenance: Provenance, payload: BaseModel) -> EnvelopeBase:
        cls = ENVELOPES[artifact_type]
        return cls(schema_version=schema_version(artifact_type), experiment_id=experiment_id,  # type: ignore[call-arg]
                   artifact_id=aid, artifact_type=artifact_type, revision=revision, logical_key=logical_key,
                   tick=tick, provenance=provenance, payload=payload,
                   content_hash=content_hash(payload_json(payload)))

    def load_payload(self, aid: str, artifact_type: str) -> BaseModel:
        stored_type, pj = self.read_object(aid)
        if stored_type != artifact_type:
            raise TypeError(f"{aid} is {stored_type}, not {artifact_type}")
        return ARTIFACT_TYPES[artifact_type].model_validate_json(json.dumps(pj))

    def entries(self, experiment_id: str, artifact_type: str | None = None) -> list[dict[str, Any]]:
        return [r for r in self.index(experiment_id) if r.get("kind") == "artifact"
                and (artifact_type is None or r["artifact_type"] == artifact_type)]

    def latest(self, experiment_id: str, artifact_type: str, logical_key: str) -> dict[str, Any] | None:
        same = [r for r in self.entries(experiment_id, artifact_type) if r["logical_key"] == logical_key]
        return same[-1] if same else None

    def ref(self, aid: str, artifact_type: str) -> ArtifactRef:
        _, pj = self.read_object(aid)
        return ArtifactRef(artifact_id=aid, artifact_type=artifact_type, content_hash=content_hash(pj))

    # ---- stage events & access log -------------------------------------------------------
    def stage(self, experiment_id: str, event: StageEvent) -> None:
        self._append(experiment_id, {"kind": "stage", "experiment_id": experiment_id,
                                     "event": event.model_dump(mode="json")})

    def stage_events(self, experiment_id: str) -> list[StageEvent]:
        return [StageEvent.model_validate_json(json.dumps(r["event"])) for r in self.index(experiment_id)
                if r.get("kind") == "stage"]

    def next_stage_seq(self, experiment_id: str) -> int:
        return len(self.stage_events(experiment_id))

    def log_access(self, experiment_id: str | None, field: FieldId, artifact_type: str, op: str) -> None:
        if experiment_id is None:
            with self._lock:
                self.memory_access.append({"kind": "access", "field": field.value, "artifact_type": artifact_type,
                                           "op": op})
                del self.memory_access[:-10000]
            return
        self._append(experiment_id, {"kind": "access", "experiment_id": experiment_id, "field": field.value,
                                     "artifact_type": artifact_type, "op": op})

    def meta(self, experiment_id: str, data: dict[str, Any]) -> None:
        self._append(experiment_id, {"kind": "meta", "experiment_id": experiment_id, **data})
