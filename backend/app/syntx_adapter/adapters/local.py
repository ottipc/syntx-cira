"""LocalAdapter — stub for a local MASTER-ENGINE process (DEP-02): ENGINE_UNAVAILABLE ⇒ BLOCKED."""

from __future__ import annotations

from ...contracts.common import AdapterKind
from ._stub import StubAdapter


class LocalAdapter(StubAdapter):
    KIND = AdapterKind.LOCAL
    NAME = "adapter.local"
