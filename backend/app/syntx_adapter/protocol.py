"""Adapter protocol (S-02). F05 input is only the ObservationBundle and the observation-based TargetDefinition (K-11).

An adapter returns an AdapterResult: either an engine response (output, trace steps, termination, proposals) or an
error (ENGINE_UNAVAILABLE ⇒ SweepRun BLOCKED). Adapters never see Ω_A, records, scenarios or metric artifacts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from ..contracts.common import ErrorRecord
from ..contracts.f04_public import ObservationBundle, TargetDefinition
from ..contracts.f05 import (AdapterDescriptor, OperatorRegistry, SweepOutput, TargetAssessment, TerminationRecord,
                             TraceStep)


@dataclass(frozen=True)
class ProposalDraft:
    proposal_id: str
    subject_refs: tuple[str, ...]
    description_from_engine: str


@dataclass(frozen=True)
class AdapterResult:
    output: SweepOutput | None = None
    steps: tuple[TraceStep, ...] = ()
    termination: TerminationRecord | None = None
    target_assessment: tuple[TargetAssessment, ...] = ()
    proposals: tuple[ProposalDraft, ...] = ()
    error: ErrorRecord | None = None
    merged: SweepOutput | None = None  # only when the engine merges itself (capabilities.merge)
    extra: dict[str, str] = field(default_factory=dict)


class EngineAdapter(Protocol):
    @property
    def descriptor(self) -> AdapterDescriptor: ...

    def available(self) -> bool: ...

    def registry(self) -> OperatorRegistry | None: ...

    def forward(self, bundle: ObservationBundle, attempt: int) -> AdapterResult: ...

    def inverse(self, bundle: ObservationBundle, target: TargetDefinition, attempt: int) -> AdapterResult: ...
