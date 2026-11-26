"""merge.policy engine_first/v1 (S-03, ADR-0004).

1. If the engine delivered a merged output (capabilities.merge), it is used verbatim (engine_merged = true);
   per-attribute differences between forward and inverse are recorded as conflicts with ENGINE_RESOLVED.
2. Otherwise per attribute: equal (status, value) ⇒ forward entry; exactly one DETERMINED ⇒ that entry;
   both DETERMINED with different values ⇒ UNDETERMINED (OPEN_REFERENCE) plus MergeConflict UNDETERMINED.
   Relations, gaps and open relations are united by key (forward first). No value is invented.
"""

from __future__ import annotations

from ..contracts.common import ArtifactRef, EpistemicClass, ReconstructionStatus, ReferenceStatus, StrategyRef
from ..contracts.f05 import MergeConflict, MergeRecord, MergeResolution, ReconstructedValue, SweepOutput


def merge(fwd: SweepOutput, inv: SweepOutput, fwd_ref: ArtifactRef, inv_ref: ArtifactRef, policy: StrategyRef,
          engine_merged: SweepOutput | None = None) -> tuple[SweepOutput, MergeRecord]:
    fv = {v.attribute_ref: v for v in fwd.values}
    iv = {v.attribute_ref: v for v in inv.values}
    conflicts: list[MergeConflict] = []
    values: list[ReconstructedValue] = []
    for a in sorted(set(fv) | set(iv)):
        f, i = fv.get(a), iv.get(a)
        if f is None or i is None:
            values.append(f or i)  # type: ignore[arg-type]
            continue
        fd, idt = f.status is ReconstructionStatus.DETERMINED, i.status is ReconstructionStatus.DETERMINED
        if (f.status, f.value) == (i.status, i.value):
            values.append(f)
        elif engine_merged is not None:
            conflicts.append(MergeConflict(attribute_ref=a, forward=f.value, inverse=i.value,
                                           resolution=MergeResolution.ENGINE_RESOLVED))
        elif fd and idt:
            conflicts.append(MergeConflict(attribute_ref=a, forward=f.value, inverse=i.value,
                                           resolution=MergeResolution.UNDETERMINED))
            values.append(ReconstructedValue(attribute_ref=a, status=ReconstructionStatus.UNDETERMINED,
                                             epistemic_class=EpistemicClass.OPEN_REFERENCE,
                                             derived_from=tuple(sorted(set(f.derived_from) | set(i.derived_from))),
                                             reference_status=ReferenceStatus.UNRESOLVED))
        else:
            values.append(f if fd else i if idt else f)
    rec = MergeRecord(policy=policy, engine_merged=engine_merged is not None, forward_ref=fwd_ref, inverse_ref=inv_ref,
                      conflicts=tuple(conflicts))
    if engine_merged is not None:
        return engine_merged, rec

    def union(a: tuple, b: tuple, key: str) -> tuple:  # type: ignore[type-arg]
        seen = {getattr(x, key) for x in a}
        return tuple(sorted(a + tuple(x for x in b if getattr(x, key) not in seen), key=lambda x: getattr(x, key)))

    out = SweepOutput(values=tuple(values), relations=union(fwd.relations, inv.relations, "relation_key"),
                      gaps=union(fwd.gaps, inv.gaps, "gap_id"),
                      open_relations=union(fwd.open_relations, inv.open_relations, "relation_key"))
    return out, rec
