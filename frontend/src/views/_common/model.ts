// Shared ViewModel types for view components (G03.3: only ViewModel files import contracts/generated).
export type {
  MetricDefinition, MetricResult, ProjectionHeader, SweepOutput, SweepRun, TraceProjection,
} from "../../contracts/generated/cira";
import type { MetricDefinition, MetricResult } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";

export const METRIC_TERM: Record<string, TermKey> = {
  M01: "metric.m01", M02: "metric.m02", M03: "metric.m03", M04: "metric.m04", M05: "metric.m05", M06: "metric.m06",
  M07: "metric.m07", M08: "metric.m08", M09: "metric.m09", M10: "metric.m10", M11: "metric.m11" };
export const METRIC_EXPLAIN: Record<string, TermKey> = {
  M01: "metric.m01.explain", M02: "metric.m02.explain", M03: "metric.m03.explain", M04: "metric.m04.explain",
  M05: "metric.m05.explain", M06: "metric.m06.explain", M07: "metric.m07.explain", M08: "metric.m08.explain",
  M09: "metric.m09.explain", M10: "metric.m10.explain", M11: "metric.m11.explain" };

export interface MetricVM { key: string; id: string; relation: string; subset: string | null; result: MetricResult; def: MetricDefinition | null }

/** Selection only: pairs each server MetricResult with its definition (target, formula). No values computed. */
export function metricVMs(results: readonly MetricResult[], defs: readonly MetricDefinition[]): MetricVM[] {
  const d = new Map(defs.map((x) => [x.metric_id, x] as const));
  return results.map((r) => ({ key: [r.metric_id, r.relation, r.case_subset ?? "", r.aux.function_ref ?? "", r.tick ?? ""].join("|"),
    id: r.metric_id, relation: r.relation, subset: r.case_subset ?? null, result: r, def: d.get(r.metric_id) ?? null }));
}
