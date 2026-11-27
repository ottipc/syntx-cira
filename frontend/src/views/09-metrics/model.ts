// View 09 ViewModel: metric bands by evaluated relation (no composite score, K-23). Selection only.
export type { MetricsProjection, ExperimentViewResponse } from "../../contracts/generated/cira";
import type { EvaluatedRelation, MetricsProjection } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
import { metricVMs, type MetricVM } from "../_common/model";

export const BANDS: readonly { term: TermKey; relations: readonly EvaluatedRelation[] }[] = [
  { term: "space.a", relations: ["A"] },
  { term: "metric.band.observation", relations: ["O", "A_O"] },
  { term: "metric.band.reconstruction", relations: ["R", "A_R", "R1_R2"] },
  { term: "metric.band.gaps", relations: ["ANNOTATION_R"] },
];
/** Evaluated relation as a pair of term keys (left vs right); single-space relations have no right side. */
export const REL_TERMS: Record<EvaluatedRelation, readonly TermKey[]> = {
  A: ["space.a.short"], O: ["space.o.short"], R: ["space.r.short"], A_O: ["space.a.short", "space.o.short"],
  A_R: ["space.a.short", "space.r.short"], ANNOTATION_R: ["ui.case", "space.r.short"], R1_R2: ["space.r.short", "space.r.short"],
  BASELINE_RECOVERY: ["ui.baseline", "ui.recovery"] };

export function bands(m: MetricsProjection): { term: TermKey; items: MetricVM[] }[] {
  const all = metricVMs(m.report.results, m.definitions);
  return BANDS.map((b) => ({ term: b.term, items: all.filter((x) => b.relations.includes(x.relation as EvaluatedRelation)) }));
}

/** View 09 resonance (04.4): the catalog's complementary pair M01 ↔ M11 (static catalog relation) and cards that share
 *  the same `reference_space` id. A card is identified by its StableId-shaped focus id. Equality on ids only (TX26). */
const COMPLEMENT: Readonly<Record<string, string>> = { M01: "M11", M11: "M01" };
export interface ResonanceVM09 { cards: readonly { key: string; id: string; space: string }[] }
export function resonanceVM(m: MetricsProjection): ResonanceVM09 {
  return { cards: bands(m).flatMap((b) => b.items).map((x) => ({ key: x.focusId, id: x.id, space: x.result.reference_space })) };
}
export function resolveResonance(focus: string, vm: ResonanceVM09): readonly string[] {
  const f = vm.cards.find((c) => c.key === focus);
  return f ? vm.cards.filter((c) => c.key !== focus && (c.id === COMPLEMENT[f.id] || c.space === f.space)).map((c) => c.key) : [];
}
