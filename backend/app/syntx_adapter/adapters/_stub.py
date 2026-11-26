"""Contract-true engine stub: always ENGINE_UNAVAILABLE (DEP-02). Never fabricates a result (E-02)."""

from __future__ import annotations

from ...contracts.common import AdapterKind, ErrorCodeC, ErrorRecord, FieldId, RecoveryAction, load
from ...contracts.f04_public import ObservationBundle, TargetDefinition
from ...contracts.f05 import AdapterDescriptor, OperatorRegistry
from ..protocol import AdapterResult


class StubAdapter:
    KIND: AdapterKind = AdapterKind.LOCAL
    NAME = "adapter.stub"

    def __init__(self, config_ref: str) -> None:
        self.config_ref = config_ref
        self._d = load(AdapterDescriptor, {
            "adapter_id": self.NAME, "kind": self.KIND.value, "adapter_version": "1.0.2", "engine_version": None,
            "is_fixture": False, "capabilities": {"forward": True, "inverse": True, "merge": True, "trace": True}})

    @property
    def descriptor(self) -> AdapterDescriptor:
        return self._d

    def available(self) -> bool:
        return False

    def registry(self) -> OperatorRegistry | None:
        return None

    def _unavailable(self, tick: int) -> AdapterResult:
        return AdapterResult(error=ErrorRecord(
            code=ErrorCodeC.ENGINE_UNAVAILABLE, field=FieldId.F05, tick=tick,
            message=f"{self.NAME}: no SYNTX engine interface available in this environment (DEP-02)",
            recovery=RecoveryAction.IMPORT_RESULT))

    def forward(self, bundle: ObservationBundle, attempt: int) -> AdapterResult:
        return self._unavailable(bundle.up_to_tick)

    def inverse(self, bundle: ObservationBundle, target: TargetDefinition, attempt: int) -> AdapterResult:
        return self._unavailable(bundle.up_to_tick)
