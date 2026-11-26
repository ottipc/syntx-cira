"""Stable identifiers (Kap. 08.1, K-01, K-38)."""

from __future__ import annotations

import re

STABLE_ID = re.compile(r"^[a-z]+:[a-z0-9][a-z0-9_.:/\-]{0,190}$")
LOCAL_NAME = re.compile(r"^[a-z0-9][a-z0-9_\-]{0,62}$")
ARTIFACT_ID = re.compile(r"^art:[0-9a-f]{32}$")


def is_stable_id(value: str) -> bool:
    return bool(STABLE_ID.match(value))


def local(stable_id: str) -> str:
    """Local part of a simple id 'prefix:local'."""
    return stable_id.split(":", 1)[1]


def node_id(name: str) -> str:
    return f"node:{name}"


def attr_id(node_local: str, attribute: str) -> str:
    return f"attr:{node_local}/{attribute}"


def attr_node(attribute_ref: str) -> str:
    """'attr:n01/state' -> 'node:n01'."""
    return "node:" + local(attribute_ref).split("/", 1)[0]


def rel_id(relation_type: str, source_local: str, target_local: str) -> str:
    return f"rel:{relation_type}:{source_local}:{target_local}"


def obs_id(source_local: str | None, attribute_ref: str, tick: int) -> str:
    """Observation IDs depend only on (source, attribute, tick) — never on Ω_A values (K-38)."""
    return f"obs:{source_local or 'none'}:{local(attribute_ref)}:t{tick}"


def sweep_id(direction: str, tick: int, attempt: int) -> str:
    return f"sweep:{'fwd' if direction == 'FORWARD' else 'inv'}:t{tick}:a{attempt}"


def recon_id(tick: int, attempt: int) -> str:
    return f"recon:t{tick}:a{attempt}"
