"""Ω_A(t+1) = T(Ω_A(t), u_t) — deterministic transition (REQ-019, D-13, D-14, K-21, K-66).

T applies the planned inputs of tick t in sequence order. Governance is not enforced (D-14): rules are target
conditions evaluated later by F06. The only governance use is the `permits` check of APPLY_APPROVAL (K-66).
Structural invalidity raises INVALID_TRANSITION; a role without permit yields EventRecord REJECTED.
"""

from __future__ import annotations

from collections.abc import Mapping

from ..contracts.common import Applicability, ErrorCodeC, ErrorRecord, FieldId, RecoveryAction
from ..contracts.f02 import Decision3, GovernanceDefinition
from ..contracts.f03 import ActualValue, AttributeChange, EventRecord, EventStatus, InputEvent, InputEventKind
from ..core.errors import CiraError, ErrorCode

# ADR-0003: an applied approval becomes the state of its attribute.
APPROVAL_SYMBOLS: dict[Decision3, str] = {Decision3.APPROVED: "AUTHORIZED", Decision3.REJECTED: "DENIED",
                                           Decision3.PENDING: "PENDING"}


def _invalid(msg: str, ev: InputEvent) -> CiraError:
    return CiraError(ErrorCode.INVALID_TRANSITION, msg, field="F03",
                     subjects=(ev.event_id,) + ((ev.attribute_ref,) if ev.attribute_ref else ()),
                     details=((f"inputs[seq={ev.seq}]", msg),))


def apply_event(state: Mapping[str, ActualValue], ev: InputEvent, domains: Mapping[str, tuple[str, ...]],
                gov: GovernanceDefinition) -> tuple[dict[str, ActualValue], EventRecord]:
    new = dict(state)
    attr = ev.attribute_ref
    assert attr is not None
    if attr not in state:
        raise _invalid(f"unknown attribute {attr}", ev)
    cur = state[attr]
    if cur.applicability is Applicability.NOT_APPLICABLE:
        raise _invalid(f"{attr} is NOT_APPLICABLE and cannot be set (K-21)", ev)
    if ev.kind is InputEventKind.SET_ATTRIBUTE:
        value = ev.value
    else:
        ap = ev.approval
        assert ap is not None
        rules = {r.rule_id: r for r in gov.rules}
        if ap.rule_ref is None or ap.rule_ref not in rules:
            raise _invalid(f"approval {ap.approval_id} references no known rule", ev)
        if ap.tick != ev.tick:
            raise _invalid(f"approval tick {ap.tick} differs from event tick {ev.tick}", ev)
        if ap.role_ref not in rules[ap.rule_ref].permits:
            return new, EventRecord(seq=ev.seq, tick=ev.tick, event_ref=ev.event_id, kind=ev.kind,
                                    status=EventStatus.REJECTED,
                                    error=ErrorRecord(code=ErrorCodeC.INVALID_TRANSITION, field=FieldId.F03,
                                                      message=f"role {ap.role_ref} has no permit for {ap.rule_ref} (K-66)",
                                                      subject_refs=(attr, ap.role_ref), tick=ev.tick,
                                                      recovery=RecoveryAction.SUBMIT_VALID_DEFINITION))
        value = APPROVAL_SYMBOLS[ap.decision]
    assert value is not None
    if value not in domains[attr]:
        raise _invalid(f"{value} not in domain of {attr}", ev)
    new[attr] = ActualValue(attribute_ref=attr, applicability=Applicability.APPLICABLE, value=value)
    return new, EventRecord(seq=ev.seq, tick=ev.tick, event_ref=ev.event_id, kind=ev.kind, status=EventStatus.APPLIED,
                            effects=(AttributeChange(attribute_ref=attr, before=cur.value, after=value),))
