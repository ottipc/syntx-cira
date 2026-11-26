"""Ω_O(t) = O_θ(Ω_A(t)) — observation generation and the projection ω(i,t) (REQ-024, REQ-025, K-09, K-21, K-38).

Generation (F04 table, K-09): one Observation per (active source, attribute, tick); for each attribute of a visible
node without an active source a placeholder UNKNOWN with source_id = null; NOT_APPLICABLE from the declaration
(static, no Ω_A reference). Observation IDs depend only on (source, attribute, tick).
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence

from ..contracts.common import Applicability, ObservationStatus
from ..contracts.f01 import ImmutableTopology
from ..contracts.f03 import ActualState
from ..contracts.f04_public import ContextBundle, Observation
from ..contracts.f04_record import ObservationConfig, ProjectedValue
from ..core.ids import local, obs_id
from ..topology.validate import declared_applicability


def observe_context(cfg: ObservationConfig, topo: ImmutableTopology, states: Sequence[ActualState], t: int
                    ) -> tuple[ContextBundle, tuple[int, ...]]:
    """Context for tick t and the Ω_A ticks it was drawn from (for ObservationRecord.actual_state_refs, K-41)."""
    decl = declared_applicability(topo.definition)
    vis = set(cfg.visible_nodes)
    vis_attrs = sorted(a.attribute_id for n in topo.definition.nodes if n.node_id in vis for a in n.attributes)
    rel_refs: dict[str, tuple[str, ...]] = {}
    for r in topo.definition.relations:
        if r.relation_id in set(cfg.visible_relations):
            rel_refs.setdefault(r.source, ())
            rel_refs[r.source] = rel_refs[r.source] + (r.relation_id,)
    obs: list[Observation] = []
    known: set[str] = set()
    used: set[int] = set()
    for s in sorted(cfg.sources, key=lambda x: x.source_id):
        if not s.active_at(t):
            continue
        k = t - s.lag_ticks
        if k < 0:
            continue
        vals = {v.attribute_ref: v for v in states[k].values}
        for a in sorted(s.observes):
            if decl[a] is Applicability.NOT_APPLICABLE or vals[a].applicability is Applicability.NOT_APPLICABLE:
                continue
            used.add(k)
            node = "node:" + local(a).split("/", 1)[0]
            obs.append(Observation(observation_id=obs_id(local(s.source_id), a, t), source_id=s.source_id, tick=t,
                                   observed_at_tick=k, attribute_ref=a, status=ObservationStatus.KNOWN,
                                   value=vals[a].value, references=tuple(sorted(rel_refs.get(node, ())))))
            known.add(a)
    for a in vis_attrs:
        if decl[a] is Applicability.NOT_APPLICABLE:
            obs.append(Observation(observation_id=obs_id(None, a, t), tick=t, observed_at_tick=t, attribute_ref=a,
                                   status=ObservationStatus.NOT_APPLICABLE))
        elif a not in known:
            obs.append(Observation(observation_id=obs_id(None, a, t), tick=t, observed_at_tick=t, attribute_ref=a,
                                   status=ObservationStatus.UNKNOWN))
    obs.sort(key=lambda o: o.observation_id)
    return ContextBundle(context_version=f"ctx:{t}", sequence=t, tick=t,
                         previous_context_ref=f"ctx:{t - 1}" if t > 0 else None, observations=tuple(obs)), \
        tuple(sorted(used))


def omega(ctx: ContextBundle | None, universe: Sequence[str], decl: Mapping[str, Applicability]
          ) -> dict[str, ProjectedValue]:
    """ω(i,t): KNOWN with the freshest observation (max observed_at_tick, tie-break source_id), else UNKNOWN or
    NOT_APPLICABLE (K-09). Attributes without any observation at t are UNKNOWN unless declared NOT_APPLICABLE."""
    out: dict[str, ProjectedValue] = {}
    by_attr: dict[str, list[Observation]] = {}
    for o in (ctx.observations if ctx else ()):
        by_attr.setdefault(o.attribute_ref, []).append(o)
    for a in universe:
        if decl.get(a) is Applicability.NOT_APPLICABLE:
            out[a] = ProjectedValue(attribute_ref=a, status=ObservationStatus.NOT_APPLICABLE)
            continue
        ks = [o for o in by_attr.get(a, []) if o.status is ObservationStatus.KNOWN]
        if not ks:
            out[a] = ProjectedValue(attribute_ref=a, status=ObservationStatus.UNKNOWN)
            continue
        best = sorted(ks, key=lambda o: (-o.observed_at_tick, o.source_id or ""))[0]
        out[a] = ProjectedValue(attribute_ref=a, status=ObservationStatus.KNOWN, value=best.value,
                                stale=best.observed_at_tick < best.tick, observed_at_tick=best.observed_at_tick,
                                source_id=best.source_id)
    return out
