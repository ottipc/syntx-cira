"""contracts.experiments — replay report and manifest entries (Kap. 08.9)."""

from __future__ import annotations

from enum import Enum

from .common import ArtifactId, ContentHash, Frozen, StableId
from .f03 import ReplayMode


class ManifestEntry(Frozen):
    artifact_id: ArtifactId
    artifact_type: str
    content_hash: ContentHash


class ReplayMatch(Frozen):
    artifact_type: str
    logical_key: str
    original_id: ArtifactId | None
    replay_id: ArtifactId | None
    equal: bool


class ReplayVerdict(str, Enum):
    IDENTICAL = "IDENTICAL"
    DIVERGENT = "DIVERGENT"


class ReplayReport(Frozen):
    original_experiment_id: StableId
    replay_experiment_id: StableId
    mode: ReplayMode
    compared_types: tuple[str, ...]
    matches: tuple[ReplayMatch, ...]
    verdict: ReplayVerdict
