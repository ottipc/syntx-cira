// View 04 ViewModel: context chain, budget, profile, register, projected observations (K-65). Selection only.
import type { ObservationProjectionBody, ProjectedValue } from "../../contracts/generated/cira";
import type { TermKey, TParams } from "../../language";
import type { SemId } from "../../semiontics";

export interface ObsRow { id: string; attribute: string; sem: SemId; value: string | null; term: TermKey | null; params?: TParams; source: string | null }

export function rows(b: ObservationProjectionBody): ObsRow[] {
  const byAttr = new Map<string, ProjectedValue>(b.projected.map((p) => [p.attribute_ref, p] as const));
  return b.context.observations.map((o) => {
    const p = byAttr.get(o.attribute_ref);
    if (o.status === "KNOWN") {
      const stale = p?.source_id === o.source_id && p?.stale === true;
      return { id: o.observation_id, attribute: o.attribute_ref, sem: stale ? "SEM-005" : "SEM-004", value: o.value ?? null,
               term: stale ? "obs.known.stale" : null, params: stale ? { k: String(o.observed_at_tick) } : undefined, source: o.source_id ?? null };
    }
    if (o.status === "NOT_APPLICABLE") return { id: o.observation_id, attribute: o.attribute_ref, sem: "SEM-008", value: null, term: "app.na", source: null };
    return { id: o.observation_id, attribute: o.attribute_ref, sem: "SEM-006", value: null, term: "obs.unknown", source: null };
  });
}
