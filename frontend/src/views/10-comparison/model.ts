// View 10 ViewModel: comparison buckets (resolved / persisting / new / unevaluable in recovery) and M09 (K-60).
export type { ComparisonResponse, ComparisonsResponse } from "../../contracts/generated/cira";
import type { ComparisonReport } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
import type { SemId } from "../../semiontics";
import { metricVMs, type MetricVM } from "../_common/model";

export interface BucketVM { term: TermKey; sem: SemId; items: readonly string[] }

export function buckets(c: ComparisonReport): BucketVM[] {
  return [
    { term: "cmp.resolved", sem: "SEM-010", items: c.resolved },
    { term: "cmp.persisting", sem: "SEM-011", items: c.persisting },
    { term: "cmp.new", sem: "SEM-011", items: c.new },
    { term: "cmp.unevaluable", sem: "SEM-012", items: c.unevaluable_in_recovery },
  ];
}

export function comparisonMetrics(c: ComparisonReport): MetricVM[] {
  return metricVMs(c.results, []);
}
