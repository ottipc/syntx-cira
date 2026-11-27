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

/** View 10 resonance (04.4): bucket entries are `(rule_id, scope)` keys of both experiments' buckets; an entry
 *  resonates with entries of the same rule id in another bucket. Selection by id equality (TX26). */
export interface ResonanceVM10 { entries: readonly { key: string; rule: string; bucket: string }[] }
/** Focus id of a bucket entry as a StableId (K-01): `rule:x|node:a,node:b` → `rule:x/node:a/node:b`. */
export const entryFocusId = (key: string): string => key.replace("|", "/").split(",").join("/");
export function resonanceVM(bs: readonly BucketVM[]): ResonanceVM10 {
  return { entries: bs.flatMap((b) => b.items.map((key) => ({ key: entryFocusId(key), rule: key.split("|")[0] ?? key, bucket: b.term }))) };
}
export function resolveResonance(focus: string, vm: ResonanceVM10): readonly string[] {
  const f = vm.entries.filter((e) => e.key === focus);
  return [...new Set(vm.entries.filter((e) => f.some((x) => x.rule === e.rule && x.bucket !== e.bucket)).map((e) => e.key))];
}
