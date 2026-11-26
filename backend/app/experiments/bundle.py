"""ExperimentBundle export/hash (08.9, K-36, K-52). No wall-clock data enters the bundle."""

from __future__ import annotations

import json
from typing import Any

from ..contracts.experiments import ManifestEntry
from ..contracts.f03 import EventRecord
from ..contracts.registry import BundleDefinitions, EnvelopeBase, ExperimentBundle
from ..core.hashing import content_hash
from ..store.cas import ArtifactStore

BUNDLE_VERSION = "1.0.2"


def _sort_key(e: EnvelopeBase) -> tuple[int, str, str, int]:
    return (-1 if e.tick is None else e.tick, e.artifact_type, e.logical_key, e.revision)  # type: ignore[attr-defined]


def bundle_hash_of(body: dict[str, Any]) -> str:
    return content_hash({k: v for k, v in body.items() if k != "bundle_hash"})


def build_bundle(store: ArtifactStore, experiment_id: str, definitions: BundleDefinitions) -> ExperimentBundle:
    envs: list[EnvelopeBase] = []
    for r in store.entries(experiment_id):
        payload = store.load_payload(r["artifact_id"], r["artifact_type"])
        from ..contracts.common import Provenance
        prov = Provenance.model_validate_json(json.dumps(r["provenance"]))
        envs.append(store.envelope(experiment_id, r["artifact_id"], r["artifact_type"], r["logical_key"],
                                   r["revision"], r["tick"], prov, payload))
    envs.sort(key=_sort_key)
    events = sorted((e.payload for e in envs if e.artifact_type == "event_record"),  # type: ignore[attr-defined]
                    key=lambda x: x.seq)
    manifest = sorted({(e.artifact_id, e.artifact_type, e.content_hash) for e in envs})  # type: ignore[attr-defined]
    body = {
        "bundle_version": BUNDLE_VERSION,
        "experiment_id": experiment_id,
        "definitions": definitions.model_dump(mode="json"),
        "artifacts": [e.model_dump(mode="json", by_alias=True) for e in envs],
        "stage_events": [s.model_dump(mode="json") for s in store.stage_events(experiment_id)],
        "events": [e.model_dump(mode="json") for e in events if isinstance(e, EventRecord)],
        "manifest": [ManifestEntry(artifact_id=a, artifact_type=t, content_hash=h).model_dump(mode="json")
                     for a, t, h in manifest],
    }
    body["bundle_hash"] = bundle_hash_of(body)
    return ExperimentBundle.model_validate_json(json.dumps(body, ensure_ascii=False))


def verify_bundle_hash(bundle: ExperimentBundle) -> bool:
    body = bundle.model_dump(mode="json", by_alias=True)
    return bool(body["bundle_hash"] == bundle_hash_of(body))
