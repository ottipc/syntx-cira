// View 07 ViewModel: gap matches (server verdicts) grouped by class_key, open gaps of the result at tick.
export type { MetricsProjection, ResultsProjection, StructuralGap } from "../../contracts/generated/cira";
import type { GapMatch, MetricsProjection, StructuralGap } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
import type { SemId } from "../../semiontics";
import { metricVMs, type MetricVM } from "../_common/model";

export const VERDICT: Record<string, { sem: SemId; term: TermKey }> = {
  TP: { sem: "SEM-010", term: "match.tp" }, FN: { sem: "SEM-011", term: "match.fn" }, FP: { sem: "SEM-011", term: "match.fp" } };

export interface ClassVM { key: string; members: GapMatch[] }

/** Subset "observable" hides cases the server marked observable = false (SubsetToggle, K-74). */
export function classes(m: MetricsProjection, observableOnly: boolean): ClassVM[] {
  const out = new Map<string, GapMatch[]>();
  for (const g of m.report.gap_matches) {
    if (observableOnly && g.observable === false) continue;
    const k = g.class_key.join(" · ");
    out.set(k, [...(out.get(k) ?? []), g]);
  }
  return [...out.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([key, members]) => ({ key, members }));
}

export function matchMetrics(m: MetricsProjection, observableOnly: boolean): MetricVM[] {
  const subset = observableOnly ? "OBSERVABLE_CASES" : "ALL";
  return metricVMs(m.report.results, m.definitions).filter((x) => x.id === "M08" || (x.id === "M07" && (x.subset ?? "ALL") === subset));
}

export function openGaps(gaps: readonly StructuralGap[] | undefined): StructuralGap[] {
  return [...(gaps ?? [])].sort((a, b) => (a.gap_id < b.gap_id ? -1 : 1));
}

/** View 07 resonance (04.4): the server's GapMatch pairs (case ↔ gap) and a gap's `source_refs`. Case rows are
 *  identified by their case id (a false positive has none and keeps its gap id). Pure selection on ids (TX26). */
export interface ResonanceVM07 { pairs: readonly (readonly [string, string])[]; sources: readonly (readonly [string, readonly string[]])[] }
export const caseRowId = (g: GapMatch): string => g.case_id ?? g.gap_id ?? "";
export function resonanceVM(m: MetricsProjection, gaps: readonly StructuralGap[]): ResonanceVM07 {
  return {
    pairs: m.report.gap_matches.flatMap((g) => (g.case_id && g.gap_id ? [[g.case_id, g.gap_id] as const] : [])),
    sources: gaps.map((g) => [g.gap_id, g.source_refs] as const),
  };
}
export function resolveResonance(focus: string, vm: ResonanceVM07): readonly string[] {
  return [...new Set([...vm.pairs.flatMap(([c, g]) => (c === focus ? [g] : g === focus ? [c] : [])),
    ...vm.sources.flatMap(([g, s]) => (g === focus ? s : []))])];
}
