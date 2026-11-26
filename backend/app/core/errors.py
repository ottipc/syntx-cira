"""Error codes and the CIRA exception (Kap. 08.1)."""

from __future__ import annotations

from enum import Enum


class ErrorCode(str, Enum):
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


class CiraError(Exception):
    def __init__(self, code: ErrorCode, message: str, field: str | None = None,
                 subjects: tuple[str, ...] = (), details: tuple[tuple[str, str], ...] = ()) -> None:
        super().__init__(f"{code.value}: {message}")
        self.code = code
        self.message = message
        self.field = field
        self.subjects = subjects
        self.details = details
