"""Δ_S (DeltaStateR) and Δ_K (DeltaCoupling) between consecutive reconstructions (07.8, K-13), via core.delta."""

from __future__ import annotations

from ..contracts.common import load
from ..contracts.f05 import (CouplingChange, DeltaCoupling, DeltaStateR, RChange, ReconstructionResult, RValueState,
                             SweepOutput)
from ..core.delta import delta_coupling, delta_state


def deltas(prev: ReconstructionResult, cur: SweepOutput, to_tick: int) -> tuple[DeltaStateR, DeltaCoupling]:
    b = {v.attribute_ref: (v.status.value, v.value) for v in prev.output.values}
    a = {v.attribute_ref: (v.status.value, v.value) for v in cur.values}

    def rv(x: tuple[str, str | None]) -> RValueState:
        return load(RValueState, {"status": x[0], "value": x[1]})

    ds = DeltaStateR(space="R", from_tick=prev.up_to_tick, to_tick=to_tick,
                     changes=tuple(RChange(attribute_ref=k, before=rv(x), after=rv(y)) for k, x, y in delta_state(b, a)))
    kb = {r.relation_key: r.coupling_status.value for r in prev.output.relations}
    ka = {r.relation_key: r.coupling_status.value for r in cur.relations}
    dk = DeltaCoupling(from_tick=prev.up_to_tick, to_tick=to_tick, changes=tuple(
        load(CouplingChange, {"relation_key": k, "before": x, "after": y})
        for k, x, y in delta_coupling(kb, ka)))
    return ds, dk
