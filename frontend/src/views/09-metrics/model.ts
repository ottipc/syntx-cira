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
