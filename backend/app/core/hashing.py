"""Content hashes and content-addressed artifact IDs (K-03)."""

from __future__ import annotations

import hashlib
from typing import Any

from .canonical_json import canonical_bytes


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def content_hash(payload: Any) -> str:
    """'sha256:<64 hex>' over the canonical JSON of a payload."""
    return "sha256:" + sha256_hex(canonical_bytes(payload))


def artifact_id(artifact_type: str, payload: Any) -> str:
    """'art:' + sha256(artifact_type ‖ 0x00 ‖ canonical(payload))[:32] (Kap. 08.1)."""
    digest = sha256_hex(artifact_type.encode("utf-8") + b"\x00" + canonical_bytes(payload))
    return "art:" + digest[:32]
