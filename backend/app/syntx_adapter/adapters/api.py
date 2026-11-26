"""ApiAdapter — stub for a remote engine API (DEP-02): ENGINE_UNAVAILABLE ⇒ BLOCKED."""

from __future__ import annotations

from ...contracts.common import AdapterKind
from ._stub import StubAdapter


class ApiAdapter(StubAdapter):
    KIND = AdapterKind.API
    NAME = "adapter.api"
