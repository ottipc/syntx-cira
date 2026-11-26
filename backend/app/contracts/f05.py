"""contracts.f05 — F05_SYNTX_ENGINE (Kap. 08.6). Imports only common, f01, f02, f04_public (T04b)."""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import Field, StringConstraints, field_validator, model_validator

from ..core.unicode import CANONICAL_SYMBOLS, is_canonical_symbol, is_nfc, is_sigma_id_v181
from .common import (AdapterKind, ArtifactRef, ContentOpenness, CouplingStatus, EpistemicClass,
                     ErrorRecord, ExecutionStatus, Frozen, ReconstructionStatus, ReferenceStatus,
                     SemVer, StableId, StrategyRef, Symbol, Text, Tick)
from .f01 import RelationType

CANONICAL_SYMBOL_SET = frozenset(CANONICAL_SYMBOLS)


def _check_symbol(v: str) -> str:
    if not is_canonical_symbol(v) or not is_nfc(v):
        raise ValueError(f"not a canonical operator symbol: {v!r} (K-31)")
    return v


class CanonicalOperatorRef(Frozen):
    namespace: Literal["CANONICAL_V181"]
    symbol: str
    registry_version: Literal["v1.8.1"]

    @field_validator("symbol")
    @classmethod
    def _sym(cls, v: str) -> str:
        return _check_symbol(v)


class ROperatorRef(Frozen):
    namespace: Literal["R"]
    code: Annotated[str, StringConstraints(pattern=r"^R(0[1-9]|1[0-8])$")]
    registry_version: str


class IOperatorRef(Frozen):
    namespace: Literal["I"]
    code: Annotated[str, StringConstraints(pattern=r"^I(0[1-9]|1[0-9])$")]
    registry_version: str


class ExternalOperatorRef(Frozen):
    namespace: Literal["EXTERNAL"]
    code: Annotated[str, StringConstraints(min_length=1, max_length=64)]
    registry_version: str


OperatorRef = Annotated[Union[CanonicalOperatorRef, ROperatorRef, IOperatorRef, ExternalOperatorRef],
                        Field(discriminator="namespace")]


class SigmaRef(Frozen):
    sigma_id: Annotated[str, StringConstraints(min_length=1, max_length=64)]
    registry_version: str

    @model_validator(mode="after")
    def _v181(self) -> "SigmaRef":
        if not is_nfc(self.sigma_id):
            raise ValueError("sigma_id must be NFC")
        if self.registry_version == "v1.8.1" and not is_sigma_id_v181(self.sigma_id):
            raise ValueError("v1.8.1 sigma_id must be Σ01–Σ30 with U+03A3 (K-31, K-33)")
        return self


class AdapterCapabilities(Frozen):
    forward: bool
    inverse: bool
    merge: bool
    trace: bool


class AdapterDescriptor(Frozen):
    adapter_id: str
    kind: AdapterKind
    adapter_version: SemVer
    engine_version: str | None = None
    is_fixture: bool
    capabilities: AdapterCapabilities
    operator_registry_ref: ArtifactRef | None = None


class RegistryOperator(Frozen):
    ref: OperatorRef
    label_from_source: Text
    description_from_source: Text = ""


class RegistrySigma(Frozen):
    ref: SigmaRef
    label_from_source: Text | None = None  # None ⇒ LABEL_UNAVAILABLE (DEP-08)


class RegistryCoupling(Frozen):
    source: SigmaRef
    target: SigmaRef | None = None
    operator: OperatorRef | None = None
    relation_label_from_source: Text


class OperatorRegistry(Frozen):
    registry_id: StableId
    version: SemVer
    source: Text
    operators: tuple[RegistryOperator, ...]
    sigma_fields: tuple[RegistrySigma, ...]
    sigma_couplings: tuple[RegistryCoupling, ...] = ()


class TraceStep(Frozen):
    step_id: StableId
    step_seq: int
    operator_ref: OperatorRef | None = None
    sigma_ref: SigmaRef | None = None
    input_refs: tuple[StableId, ...] = ()
    output_refs: tuple[StableId, ...] = ()
    epistemic_class: EpistemicClass
    engine_note: Text | None = None


class SweepTrace(Frozen):
    sweep_id: StableId
    steps: tuple[TraceStep, ...]
    reference_status: ReferenceStatus


class TerminationReason(str, Enum):
    CONVERGED = "CONVERGED"
    ENGINE_REPORTED_STOP = "ENGINE_REPORTED_STOP"
    BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED"
    TRUNCATED = "TRUNCATED"
    ERROR = "ERROR"
    CANCELLED = "CANCELLED"


class TerminationRecord(Frozen):
    reason: TerminationReason
    steps_executed: int
    budget: int | None = None
    last_step_seq: int | None = None
    engine_message: Text | None = None


class SweepDirection(str, Enum):
    FORWARD = "FORWARD"
    INVERSE = "INVERSE"


class SweepRun(Frozen):
    sweep_id: StableId
    direction: SweepDirection
    attempt: int
    adapter: AdapterDescriptor
    input_bundle_ref: ArtifactRef
    target_ref: ArtifactRef | None = None
    up_to_tick: Tick
    context_version: StableId
    execution_status: ExecutionStatus
    termination: TerminationRecord | None = None
    error: ErrorRecord | None = None

    @model_validator(mode="after")
    def _inv(self) -> "SweepRun":
        if self.direction is SweepDirection.FORWARD and self.target_ref is not None:
            raise ValueError("FORWARD sweep must not receive a target (T08)")
        if self.direction is SweepDirection.INVERSE and self.target_ref is None:
            raise ValueError("INVERSE sweep needs a target")
        if self.execution_status in (ExecutionStatus.CREATED, ExecutionStatus.RUNNING):
            raise ValueError("SweepRun is written once with its final status (K-35)")
        if self.execution_status is not ExecutionStatus.BLOCKED and self.termination is None:
            raise ValueError("non-BLOCKED SweepRun needs a TerminationRecord (T12)")
        return self


class ReconstructedValue(Frozen):
    attribute_ref: StableId
    status: ReconstructionStatus
    value: Symbol | None = None
    epistemic_class: EpistemicClass | None = None
    derived_from: tuple[StableId, ...] = ()
    reference_status: ReferenceStatus = ReferenceStatus.RESOLVED

    @model_validator(mode="after")
    def _inv(self) -> "ReconstructedValue":
        determined = self.status is ReconstructionStatus.DETERMINED
        if determined != (self.value is not None):
            raise ValueError("DETERMINED ⇔ value ≠ null")
        if determined and self.epistemic_class in (None, EpistemicClass.OPEN_REFERENCE):
            raise ValueError("DETERMINED ⇒ class ∉ {null, OPEN_REFERENCE} (K-14)")
        return self


class RelationAssertion(Frozen):
    relation_key: StableId
    relation_type: RelationType | None = None
    source: StableId
    target: StableId
    coupling_status: CouplingStatus
    epistemic_class: EpistemicClass
    derived_from: tuple[StableId, ...] = ()


class GapStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED_IN_RESULT = "CLOSED_IN_RESULT"


class StructuralGap(Frozen):
    gap_id: StableId
    kind: str
    subject_refs: tuple[StableId, ...]
    source_refs: tuple[StableId, ...] = Field(min_length=1)
    epistemic_class: EpistemicClass
    status: GapStatus


class OpenRelation(Frozen):
    relation_key: StableId
    subject_refs: tuple[StableId, ...]
    reason: Text
    reference_status: ReferenceStatus


class SweepOutput(Frozen):
    values: tuple[ReconstructedValue, ...]
    relations: tuple[RelationAssertion, ...] = ()
    gaps: tuple[StructuralGap, ...] = ()
    open_relations: tuple[OpenRelation, ...] = ()


class ForwardResult(Frozen):
    sweep: SweepRun
    output: SweepOutput
    trace: SweepTrace


class AssessmentStatus(str, Enum):
    MET = "MET"
    NOT_MET = "NOT_MET"
    UNDETERMINED = "UNDETERMINED"


class TargetAssessment(Frozen):
    goal_id: StableId
    status: AssessmentStatus
    derived_from: tuple[StableId, ...] = ()


class InverseResult(Frozen):
    sweep: SweepRun
    output: SweepOutput
    target_assessment: tuple[TargetAssessment, ...]
    trace: SweepTrace


class MergeResolution(str, Enum):
    UNDETERMINED = "UNDETERMINED"
    ENGINE_RESOLVED = "ENGINE_RESOLVED"


class MergeConflict(Frozen):
    attribute_ref: StableId
    forward: Symbol | None = None
    inverse: Symbol | None = None
    resolution: MergeResolution


class MergeRecord(Frozen):
    policy: StrategyRef
    engine_merged: bool
    forward_ref: ArtifactRef
    inverse_ref: ArtifactRef
    conflicts: tuple[MergeConflict, ...] = ()


class RValueState(Frozen):
    status: ReconstructionStatus | Literal["ABSENT"]
    value: Symbol | None = None


class RChange(Frozen):
    attribute_ref: StableId
    before: RValueState
    after: RValueState


class DeltaStateR(Frozen):
    space: Literal["R"]
    from_tick: Tick
    to_tick: Tick
    changes: tuple[RChange, ...]


class CouplingChange(Frozen):
    relation_key: StableId
    before: CouplingStatus | Literal["ABSENT"]
    after: CouplingStatus | Literal["ABSENT"]


class DeltaCoupling(Frozen):
    from_tick: Tick
    to_tick: Tick
    changes: tuple[CouplingChange, ...]


class ReconstructionResult(Frozen):
    reconstruction_id: StableId
    attempt: int
    up_to_tick: Tick
    context_version: StableId
    merge: MergeRecord
    output: SweepOutput
    previous_reconstruction_ref: ArtifactRef | None = None
    delta_state: DeltaStateR | None = None
    delta_coupling: DeltaCoupling | None = None
    openness: ContentOpenness


class RecoveryProposal(Frozen):
    proposal_id: StableId
    reconstruction_ref: ArtifactRef
    subject_refs: tuple[StableId, ...]
    description_from_engine: Text
    status: Literal["PROPOSED"]
