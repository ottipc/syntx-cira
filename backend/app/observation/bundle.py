"""Cumulative ObservationBundle with serialization profiles and bundle-level budget (REQ-026, REQ-027, K-12, D-18).

Profiles (lossless, ADR-0003): `full` carries every observation incl. placeholders; `compact` carries KNOWN
observations only — UNKNOWN follows from ω, NOT_APPLICABLE from the observable declaration. Budget unit
`items_bytes/v1`: observations = Σ |observations| over contexts, bytes = |canonical(contexts)|.
No silent truncation: a profile over budget is never shipped; the next profile is tried, and when all are
exhausted the tick has no bundle (CONTEXT_INCOMPLETE ⇒ sweeps of the tick BLOCKED, experiment PARTIAL).
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from ..contracts.common import (ErrorCodeC, ErrorRecord, FieldId, ObservationStatus, RecoveryAction, TickRange,
                                payload_json)
from ..contracts.f01 import ImmutableTopology
from ..contracts.f02 import GovernanceDefinition
from ..contracts.f03 import ActualState
from ..contracts.f04_public import (BudgetUsage, ContextBundle, Continuity, ObservableRules,
                                    ObservableTopologyDefinition, ObservationBundle, SourceReferenceRegister,
                                    SourceRegisterEntry)
from ..contracts.f04_record import ObservationConfig
from ..core.canonical_json import canonical_bytes
from .observer import observe_context
from .theta import observable_rules, observable_topology, validate_config


def serialize(ctx: ContextBundle, profile: str) -> ContextBundle:
    if profile == "full":
        return ctx
    return ContextBundle(context_version=ctx.context_version, sequence=ctx.sequence, tick=ctx.tick,
                         previous_context_ref=ctx.previous_context_ref,
                         observations=tuple(o for o in ctx.observations if o.status is ObservationStatus.KNOWN))


def usage(contexts: Sequence[ContextBundle]) -> BudgetUsage:
    return BudgetUsage(observations=sum(len(c.observations) for c in contexts),
                       bytes=len(canonical_bytes([payload_json(c) for c in contexts])))


def source_register(contexts: Sequence[ContextBundle]) -> SourceReferenceRegister:
    ticks: dict[str, list[int]] = {}
    for c in contexts:
        for o in c.observations:
            if o.source_id is not None:
                ticks.setdefault(o.source_id, [])
                if c.tick not in ticks[o.source_id]:
                    ticks[o.source_id].append(c.tick)
    entries = []
    for s in sorted(ticks):
        ts = sorted(ticks[s])
        gaps = []
        for a, b in zip(ts, ts[1:]):
            if b > a + 1:
                gaps.append(TickRange(from_tick=a + 1, to_tick=b - 1))
        entries.append(SourceRegisterEntry(source_id=s, first_tick=ts[0], last_tick=ts[-1],
                                           continuity=Continuity.INTERRUPTED if gaps else Continuity.CONTINUOUS,
                                           gaps=tuple(gaps)))
    return SourceReferenceRegister(entries=tuple(entries))


@dataclass(frozen=True)
class TickObservation:
    tick: int
    context: ContextBundle                     # full context (record/projection side)
    state_ticks: tuple[int, ...]               # Ω_A ticks used, incl. lag (K-41)
    bundle: ObservationBundle | None           # None ⇔ all profiles exhausted
    errors: tuple[ErrorRecord, ...]


@dataclass(frozen=True)
class ObservationRun:
    observable_topology: ObservableTopologyDefinition
    observable_rules: ObservableRules
    ticks: tuple[TickObservation, ...]

    def register_at(self, t: int) -> SourceReferenceRegister:
        return source_register([x.context for x in self.ticks[: t + 1]])


def observe(cfg: ObservationConfig, topo: ImmutableTopology, gov: GovernanceDefinition,
            states: Sequence[ActualState]) -> ObservationRun:
    validate_config(cfg, topo, gov)
    otopo, orules = observable_topology(cfg, topo), observable_rules(cfg, gov)
    contexts: list[ContextBundle] = []
    out: list[TickObservation] = []
    pidx = 0
    for t in range(len(states)):
        ctx, used = observe_context(cfg, topo, states, t)
        contexts.append(ctx)
        errors: list[ErrorRecord] = []
        bundle = None
        while pidx < len(cfg.serialization_profiles):
            prof = cfg.serialization_profiles[pidx]
            ser = [serialize(c, prof) for c in contexts]
            u = usage(ser)
            if u.observations <= cfg.bundle_budget.max_observations and u.bytes <= cfg.bundle_budget.max_bytes:
                bundle = ObservationBundle(bundle_key=f"bundle:t{t}", up_to_tick=t, contexts=tuple(ser),
                                           observable_topology=otopo, observable_rules=orules,
                                           source_register=source_register(ser), serialization_profile=prof,
                                           budget_usage=u)
                break
            errors.append(ErrorRecord(
                code=ErrorCodeC.CONTEXT_INCOMPLETE, field=FieldId.F04, tick=t,
                message=f"profile {prof} exceeds bundle budget ({u.observations} obs, {u.bytes} B > "
                        f"{cfg.bundle_budget.max_observations} obs, {cfg.bundle_budget.max_bytes} B)",
                recovery=RecoveryAction.RESERIALIZE))
            pidx += 1
        out.append(TickObservation(tick=t, context=ctx, state_ticks=used, bundle=bundle, errors=tuple(errors)))
    return ObservationRun(observable_topology=otopo, observable_rules=orules, ticks=tuple(out))
