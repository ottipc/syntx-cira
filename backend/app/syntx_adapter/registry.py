"""Operator / Σ registry lookups — the only place allowed to match on OperatorRef.symbol/.code/.namespace or
SigmaRef.sigma_id (TX11, K-32). Missing labels are reported as LABEL_UNAVAILABLE (DEP-08)."""

from __future__ import annotations

from ..contracts.f05 import OperatorRef, OperatorRegistry, SigmaRef

LABEL_UNAVAILABLE = "LABEL_UNAVAILABLE"


def _op_key(r: OperatorRef) -> tuple[str, str, str]:
    code = getattr(r, "symbol", None) or getattr(r, "code", "")
    return (r.namespace, str(code), r.registry_version)


def operator_label(reg: OperatorRegistry | None, ref: OperatorRef) -> str:
    if reg is None:
        return LABEL_UNAVAILABLE
    for op in reg.operators:
        if _op_key(op.ref) == _op_key(ref):
            return op.label_from_source
    return LABEL_UNAVAILABLE


def sigma_label(reg: OperatorRegistry | None, ref: SigmaRef) -> str:
    if reg is None:
        return LABEL_UNAVAILABLE
    for s in reg.sigma_fields:
        if (s.ref.sigma_id, s.ref.registry_version) == (ref.sigma_id, ref.registry_version):
            return s.label_from_source or LABEL_UNAVAILABLE
    return LABEL_UNAVAILABLE


def labels(reg: OperatorRegistry | None, ops: list[OperatorRef], sigmas: list[SigmaRef]) -> dict[str, str]:
    out: dict[str, str] = {}
    for o in ops:
        out[":".join(_op_key(o))] = operator_label(reg, o)
    for s in sigmas:
        out[f"SIGMA:{s.sigma_id}:{s.registry_version}"] = sigma_label(reg, s)
    return out
