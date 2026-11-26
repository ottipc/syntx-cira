"""contracts.common — shared contract types (Kap. 08.1). Imports only core."""

from __future__ import annotations

import json
from enum import Enum
from typing import Annotated, Any, TypeVar

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints, model_validator

from ..core.hashing import artifact_id as _artifact_id
from ..core.hashing import content_hash as _content_hash
from ..core.unicode import nfc


class Frozen(BaseModel):
    """Base of every contract: extra='forbid', strict=True, frozen=True (REQ-063)."""

    model_config = ConfigDict(extra="forbid", strict=True, frozen=True,
                              serialize_by_alias=True, validate_by_alias=True, validate_by_name=True)


def _nfc(v: str) -> str:
    if nfc(v) != v:
        raise ValueError("string must be NFC-normalised")
    return v


StableId = Annotated[str, StringConstraints(pattern=r"^[a-z]+:[a-z0-9][a-z0-9_.:/\-]{0,190}$")]
LocalName = Annotated[str, StringConstraints(pattern=r"^[a-z0-9][a-z0-9_\-]{0,62}$")]
ArtifactId = Annotated[str, StringConstraints(pattern=r"^art:[0-9a-f]{32}$")]
SemVer = Annotated[str, StringConstraints(pattern=r"^\d+\.\d+\.\d+$")]
SchemaVersion = Annotated[str, StringConstraints(pattern=r"^cira\.[a-z_]+/\d+\.\d+\.\d+$")]
Symbol = Annotated[str, StringConstraints(pattern=r"^[A-Z][A-Z0-9_]{0,63}$")]
ContentHash = Annotated[str, StringConstraints(pattern=r"^sha256:[0-9a-f]{64}$")]
Tick = Annotated[int, Field(ge=0)]
Seq = Annotated[int, Field(ge=0)]
Text = Annotated[str, AfterValidator(_nfc)]


class Rational(Frozen):
    n: Annotated[int, Field(ge=0)]
    d: Annotated[int, Field(ge=1)]

    @model_validator(mode="after")
    def _reduced(self) -> "Rational":
        from math import gcd
        if gcd(self.n, self.d) != 1 and not (self.n == 0 and self.d == 1):
            raise ValueError("Rational must be reduced")
        return self


class FieldId(str, Enum):
    F01 = "F01"
    F02 = "F02"
    F03 = "F03"
    F04 = "F04"
    F05 = "F05"
    F06 = "F06"
    F07 = "F07"


class StateSpace(str, Enum):
    A = "A"
    O = "O"  # noqa: E741
    R = "R"


class DataOrigin(str, Enum):
    SYNTHETIC = "SYNTHETIC"
    FIXTURE = "FIXTURE"
    ENGINE = "ENGINE"
    IMPORTED = "IMPORTED"
    ILLUSTRATIVE = "ILLUSTRATIVE"


class ExecutionStatus(str, Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"


class CouplingStatus(str, Enum):
    EFFECTIVE = "EFFECTIVE"
    POSSIBLE = "POSSIBLE"
    UNKNOWN_OPEN = "UNKNOWN_OPEN"


class EpistemicClass(str, Enum):
    SOURCE_OBSERVATION = "SOURCE_OBSERVATION"
    SOURCE_STATEMENT = "SOURCE_STATEMENT"
    STRUCTURAL_DERIVATION = "STRUCTURAL_DERIVATION"
    HYPOTHESIS = "HYPOTHESIS"
    OPEN_REFERENCE = "OPEN_REFERENCE"


class ObservationStatus(str, Enum):
    KNOWN = "KNOWN"
    UNKNOWN = "UNKNOWN"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class ReconstructionStatus(str, Enum):
    DETERMINED = "DETERMINED"
    UNDETERMINED = "UNDETERMINED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class Applicability(str, Enum):
    APPLICABLE = "APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class RuleResult(str, Enum):
    TRUE = "TRUE"
    FALSE = "FALSE"
    UNEVALUABLE = "UNEVALUABLE"


class ReferenceStatus(str, Enum):
    RESOLVED = "RESOLVED"
    UNRESOLVED = "UNRESOLVED"
    TRUNCATED = "TRUNCATED"
    EXTERNAL = "EXTERNAL"


class AdapterKind(str, Enum):
    FIXTURE = "FIXTURE"
    LOCAL = "LOCAL"
    API = "API"
    IMPORT = "IMPORT"


class ContentAvailability(str, Enum):
    AVAILABLE = "AVAILABLE"
    NOT_AVAILABLE_AT_TICK = "NOT_AVAILABLE_AT_TICK"


class ErrorCodeC(str, Enum):
    INVALID_TOPOLOGY = "INVALID_TOPOLOGY"
    INVALID_RULE = "INVALID_RULE"
    INVALID_TRANSITION = "INVALID_TRANSITION"
    CONTEXT_INCOMPLETE = "CONTEXT_INCOMPLETE"
    ENGINE_UNAVAILABLE = "ENGINE_UNAVAILABLE"
    METRIC_UNDEFINED = "METRIC_UNDEFINED"
    VIEW_DATA_UNAVAILABLE = "VIEW_DATA_UNAVAILABLE"
    SCHEMA_VIOLATION = "SCHEMA_VIOLATION"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    ACCESS_VIOLATION = "ACCESS_VIOLATION"
    IMPORT_INVALID = "IMPORT_INVALID"
    COMPARISON_INCOMPATIBLE = "COMPARISON_INCOMPATIBLE"


class RecoveryAction(str, Enum):
    SUBMIT_VALID_DEFINITION = "SUBMIT_VALID_DEFINITION"
    REVERT_TO_VERSION = "REVERT_TO_VERSION"
    REPLAY_FROM_INITIAL = "REPLAY_FROM_INITIAL"
    RESERIALIZE = "RESERIALIZE"
    RESWEEP = "RESWEEP"
    IMPORT_RESULT = "IMPORT_RESULT"
    RECOMPUTE = "RECOMPUTE"
    REFETCH = "REFETCH"


class ErrorRecord(Frozen):
    code: ErrorCodeC
    field: FieldId
    message: Text
    subject_refs: tuple[StableId, ...] = ()
    tick: Tick | None = None
    recovery: RecoveryAction


class ArtifactRef(Frozen):
    artifact_id: ArtifactId
    artifact_type: str
    content_hash: ContentHash


M = TypeVar("M", bound=BaseModel)


def payload_json(model: BaseModel) -> Any:
    """JSON form of a contract payload (by alias) — the basis of content addressing."""
    return model.model_dump(mode="json", by_alias=True)


def make_ref(artifact_type: str, model: BaseModel) -> ArtifactRef:
    pj = payload_json(model)
    return ArtifactRef(artifact_id=_artifact_id(artifact_type, pj), artifact_type=artifact_type,
                       content_hash=_content_hash(pj))


def load(cls: type[M], data: Any) -> M:
    """Strict validation of JSON-shaped data (enums as strings) through the JSON path."""
    return cls.model_validate_json(json.dumps(data, ensure_ascii=False))


class Provenance(Frozen):
    source_field: FieldId
    source_refs: tuple[ArtifactRef, ...] = ()
    producer_id: str
    producer_version: SemVer
    data_origin: DataOrigin


class StrategyRef(Frozen):
    point: Annotated[str, StringConstraints(pattern=r"^[a-z_]+\.[a-z_]+$")]
    variant: Annotated[str, StringConstraints(pattern=r"^[a-z0-9_]+$")]
    version: Annotated[int, Field(ge=1)]

    def key(self) -> str:
        return f"{self.point}:{self.variant}/v{self.version}"


class ContentOpenness(Frozen):
    undetermined: int = 0
    unknown_observations: int = 0
    open_references: int = 0
    open_relations: int = 0
    structural_gaps_open: int = 0
    unevaluable_rules: int = 0


class StageName(str, Enum):
    DEFINITIONS = "DEFINITIONS"
    EMULATION = "EMULATION"
    OBSERVATION = "OBSERVATION"
    FORWARD = "FORWARD"
    INVERSE = "INVERSE"
    MERGE = "MERGE"
    STABILITY = "STABILITY"
    EVALUATION = "EVALUATION"
    EXPORT = "EXPORT"


class StageEvent(Frozen):
    seq: Seq
    stage: StageName
    status: ExecutionStatus
    tick: Tick | None = None
    error: ErrorRecord | None = None


class TickRange(Frozen):
    from_tick: Tick
    to_tick: Tick | None = None

    def contains(self, t: int) -> bool:
        return self.from_tick <= t and (self.to_tick is None or t <= self.to_tick)
