"""Canonical JSON (Kap. 08, X-03): sorted keys, no whitespace, UTF-8, NFC-normalised strings."""

from __future__ import annotations

import json
import math
from typing import Any

from .unicode import nfc


def _normalise(value: Any) -> Any:
    if isinstance(value, str):
        return nfc(value)
    if isinstance(value, dict):
        return {nfc(str(k)): _normalise(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_normalise(v) for v in value]
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("non-finite float in canonical JSON")
        return value
    return value


def canonical_bytes(value: Any) -> bytes:
    """Serialise a JSON-compatible value deterministically."""
    return json.dumps(
        _normalise(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    ).encode("utf-8")


def canonical_str(value: Any) -> str:
    return canonical_bytes(value).decode("utf-8")
