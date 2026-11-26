"""Scenario runner (REQ-018, REQ-021, REQ-022): validates a scenario and produces Ω_A(0..N−1) and EventRecords.

Pure function of (ScenarioDefinition, ImmutableTopology, GovernanceDefinition): same input ⇒ same artifacts (K-03).
"""

from __future__ import annotations

from dataclasses import dataclass

from ..contracts.common import Applicability, make_ref
from ..contracts.f01 import ImmutableTopology
from ..contracts.f02 import GovernanceDefinition
from ..contracts.f03 import ActualState, ActualValue, EventRecord, ScenarioDefinition, VariantKind
from ..core.errors import CiraError, ErrorCode
from ..topology.validate import attribute_domains, declared_applicability
from .transition import apply_event


@dataclass(frozen=True)
class Emulation:
    states: tuple[ActualState, ...]
    events: tuple[EventRecord, ...]


def validate_scenario(s: ScenarioDefinition, topo: ImmutableTopology, gov: GovernanceDefinition) -> None:
    issues: list[tuple[str, str]] = []
    if s.topology_ref != make_ref("topology_definition", topo.definition):
        issues.append(("topology_ref", "does not reference the sealed topology"))
    if s.governance_ref != make_ref("governance_definition", gov):
        issues.append(("governance_ref", "does not reference the governance definition"))
    if gov.topology_ref != s.topology_ref:
        issues.append(("governance_ref", "governance is bound to a different topology"))
    doms = attribute_domains(topo.definition)
    decl = declared_applicability(topo.definition)
    init = {v.attribute_ref: v for v in s.initial_state}
    if sorted(init) != list(topo.attribute_universe) or len(init) != len(s.initial_state):
        issues.append(("initial_state", "must cover the attribute universe exactly once"))
    for a, v in init.items():
        if a in decl and v.applicability is not decl[a]:
            issues.append((f"initial_state[{a}]", "applicability differs from declaration (K-21)"))
        if v.value is not None and a in doms and v.value not in doms[a]:
            issues.append((f"initial_state[{a}]", f"{v.value} not in domain"))
    last = (-1, -1)
    for i, ev in enumerate(s.inputs):
        if (ev.tick, ev.seq) <= last or ev.seq <= last[1] or ev.tick < last[0]:
            issues.append((f"inputs[{i}]", "tick and seq must be strictly monotonic (REQ-018)"))
        last = (ev.tick, ev.seq)
        if not 0 <= ev.tick <= s.tick_count - 2:
            issues.append((f"inputs[{i}]", f"input tick {ev.tick} outside 0..{s.tick_count - 2} (u_t acts on t+1)"))
    for f in s.service_function_refs:
        if f not in {r.rule_id for r in gov.rules if r.kind.value == "FUNCTION"}:
            issues.append(("service_function_refs", f"{f} is not a FUNCTION rule"))
    if s.variant_kind is VariantKind.BASELINE and s.variant_of is not None:
        issues.append(("variant_of", "BASELINE must not have variant_of"))
    if issues:
        raise CiraError(ErrorCode.INVALID_TRANSITION, "; ".join(i for _, i in issues), field="F03",
                        details=tuple(issues))


def run_scenario(s: ScenarioDefinition, topo: ImmutableTopology, gov: GovernanceDefinition) -> Emulation:
    validate_scenario(s, topo, gov)
    doms = attribute_domains(topo.definition)
    ref = make_ref("scenario_definition", s)
    state = {v.attribute_ref: v for v in s.initial_state}
    states: list[ActualState] = []
    events: list[EventRecord] = []
    last_seq: int | None = None
    by_tick: dict[int, list[int]] = {}
    for i, ev in enumerate(s.inputs):
        by_tick.setdefault(ev.tick, []).append(i)
    for t in range(s.tick_count):
        states.append(ActualState(scenario_ref=ref, tick=t, last_seq=last_seq,
                                  values=tuple(state[a] for a in sorted(state))))
        for i in by_tick.get(t, []):
            state, rec = apply_event(state, s.inputs[i], doms, gov)
            events.append(rec)
            last_seq = s.inputs[i].seq
    for st in states:
        for v in st.values:
            if v.applicability is Applicability.APPLICABLE:
                assert v.value is not None
    return Emulation(states=tuple(states), events=tuple(events))


def actual_values(st: ActualState) -> dict[str, ActualValue]:
    return {v.attribute_ref: v for v in st.values}
