"""ImportExportAdapter (IMPORTED). Serves externally produced engine results that were validated against the
contract SSOT (from which the bundled schema is generated). Missing documents ⇒ ENGINE_UNAVAILABLE."""

from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from ...contracts.common import AdapterKind, ErrorCodeC, ErrorRecord, FieldId, RecoveryAction, load
from ...contracts.f04_public import ObservationBundle, TargetDefinition
from ...contracts.f05 import AdapterDescriptor, OperatorRegistry, SweepOutput, TargetAssessment, TerminationRecord, TraceStep
from ...core.errors import CiraError, ErrorCode
from ..protocol import AdapterResult, ProposalDraft


def validate_document(doc: dict[str, Any]) -> dict[str, Any]:
    """IMPORT_INVALID unless the document matches the contracts exactly (strict, extra=forbid)."""
    try:
        tick, attempt = int(doc["tick"]), int(doc.get("attempt", 0))
        for d in ("forward", "inverse"):
            part = doc[d]
            load(SweepOutput, part["output"])
            for s in part["trace"]:
                load(TraceStep, {**s, "step_id": s.get("step_id", "step:import:0")})
            load(TerminationRecord, part["termination"])
            for x in part.get("target_assessment", []):
                load(TargetAssessment, x)
        if "target_assessment" in doc["forward"]:
            raise ValueError("forward result must not carry a target assessment")
        for p in doc.get("proposals", []):
            if set(p) != {"proposal_id", "subject_refs", "description_from_engine"}:
                raise ValueError("proposal fields")
    except (KeyError, TypeError, ValueError, ValidationError) as e:
        raise CiraError(ErrorCode.IMPORT_INVALID, f"import document invalid: {str(e)[:400]}", field="F05") from e
    return {**doc, "tick": tick, "attempt": attempt}


class ImportExportAdapter:
    def __init__(self, config_ref: str, documents: dict[tuple[int, int], dict[str, Any]]) -> None:
        self.config_ref = config_ref
        self.documents = documents
        ev = next((d.get("engine_version") for d in documents.values() if d.get("engine_version")), None)
        self._d = load(AdapterDescriptor, {
            "adapter_id": "adapter.import", "kind": AdapterKind.IMPORT.value, "adapter_version": "1.0.2",
            "engine_version": ev, "is_fixture": False,
            "capabilities": {"forward": True, "inverse": True, "merge": False, "trace": True}})

    @property
    def descriptor(self) -> AdapterDescriptor:
        return self._d

    def available(self) -> bool:
        return bool(self.documents)

    def registry(self) -> OperatorRegistry | None:
        return None

    def _get(self, bundle: ObservationBundle, attempt: int, d: str) -> AdapterResult:
        doc = self.documents.get((bundle.up_to_tick, attempt))
        if doc is None:
            return AdapterResult(error=ErrorRecord(code=ErrorCodeC.ENGINE_UNAVAILABLE, field=FieldId.F05,
                                                   tick=bundle.up_to_tick, recovery=RecoveryAction.IMPORT_RESULT,
                                                   message=f"no imported result for t{bundle.up_to_tick} a{attempt}"))
        part = doc[d]
        loc = f"{'fwd' if d == 'forward' else 'inv'}:t{bundle.up_to_tick}:a{attempt}"
        steps = tuple(load(TraceStep, {**s, "step_id": s.get("step_id", f"step:{loc}:{s['step_seq']}")})
                      for s in part["trace"])
        return AdapterResult(output=load(SweepOutput, part["output"]), steps=steps,
                             termination=load(TerminationRecord, part["termination"]),
                             target_assessment=tuple(load(TargetAssessment, x) for x in part.get("target_assessment", [])),
                             proposals=tuple(ProposalDraft(p["proposal_id"], tuple(p["subject_refs"]),
                                                           p["description_from_engine"])
                                             for p in (doc.get("proposals", []) if d == "inverse" else [])))

    def forward(self, bundle: ObservationBundle, attempt: int) -> AdapterResult:
        return self._get(bundle, attempt, "forward")

    def inverse(self, bundle: ObservationBundle, target: TargetDefinition, attempt: int) -> AdapterResult:
        return self._get(bundle, attempt, "inverse")
