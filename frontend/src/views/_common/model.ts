// Shared ViewModel types for view components (G03.3: only ViewModel files import contracts/generated).
export type {
  MetricDefinition, MetricResult, ProjectionHeader, SweepOutput, SweepRun, TraceProjection,
} from "../../contracts/generated/cira";
import type { MetricDefinition, MetricResult, TraceProjection } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";

export const METRIC_TERM: Record<string, TermKey> = {
  M01: "metric.m01", M02: "metric.m02", M03: "metric.m03", M04: "metric.m04", M05: "metric.m05", M06: "metric.m06",
  M07: "metric.m07", M08: "metric.m08", M09: "metric.m09", M10: "metric.m10", M11: "metric.m11" };
export const METRIC_EXPLAIN: Record<string, TermKey> = {
  M01: "metric.m01.explain", M02: "metric.m02.explain", M03: "metric.m03.explain", M04: "metric.m04.explain",
  M05: "metric.m05.explain", M06: "metric.m06.explain", M07: "metric.m07.explain", M08: "metric.m08.explain",
  M09: "metric.m09.explain", M10: "metric.m10.explain", M11: "metric.m11.explain" };

export interface MetricVM { key: string; /** StableId for focus (K-01) */ focusId: string; id: string; relation: string; subset: string | null; result: MetricResult; def: MetricDefinition | null }

/** Selection only: pairs each server MetricResult with its definition (target, formula). No values computed. */
export function metricVMs(results: readonly MetricResult[], defs: readonly MetricDefinition[]): MetricVM[] {
  const d = new Map(defs.map((x) => [x.metric_id, x] as const));
  return results.map((r) => ({ key: [r.metric_id, r.relation, r.case_subset ?? "", r.aux.function_ref ?? "", r.tick ?? ""].join("|"),
    focusId: `metric:${[r.metric_id, r.relation, r.case_subset ?? "", r.aux.function_ref ?? "", r.tick ?? ""].join("/").toLowerCase()}`,
    id: r.metric_id, relation: r.relation, subset: r.case_subset ?? null, result: r, def: d.get(r.metric_id) ?? null }));
}

/** Views 05/06 resonance (architecture v2.0.3, 04.4): `trace.steps[].input_refs/output_refs`, and for view 06
 *  `target_assessment[].derived_from`. Step → its outputs (and goals whose basis it reads or writes); output → steps
 *  producing it; goal → steps behind it and their outputs. Pure selection on ids (TX26). */
export interface ResonanceVMRun {
  steps: readonly { id: string; inputs: readonly string[]; outputs: readonly string[] }[];
  goals: readonly { id: string; basis: readonly string[] }[];
}
export function runResonanceVM(tr: TraceProjection | null, goals: readonly { goal_id: string; derived_from?: readonly string[] | null }[] = []): ResonanceVMRun {
  return {
    steps: (tr?.trace.content?.steps ?? []).map((s) => ({ id: s.step_id, inputs: s.input_refs, outputs: s.output_refs })),
    goals: goals.map((g) => ({ id: g.goal_id, basis: g.derived_from ?? [] })),
  };
}
export function resolveRunResonance(focus: string, vm: ResonanceVMRun): readonly string[] {
  const touches = (s: ResonanceVMRun["steps"][number], ids: readonly string[]) => ids.some((x) => s.inputs.includes(x) || s.outputs.includes(x));
  const goal = vm.goals.find((g) => g.id === focus);
  const step = vm.steps.find((s) => s.id === focus);
  const out = goal ? vm.steps.filter((s) => touches(s, goal.basis)).flatMap((s) => [s.id, ...s.outputs])
    : step ? [...step.outputs, ...vm.goals.filter((g) => touches(step, g.basis)).map((g) => g.id)]
    : vm.steps.filter((s) => s.outputs.includes(focus)).map((s) => s.id);
  return [...new Set(out)];
}
