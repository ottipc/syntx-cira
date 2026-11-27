// View 01 ViewModel: layer chain from manifests (K-62), pipeline from ExperimentView (K-59). Selection only.
import type { ContentOpenness, ExperimentView, FieldsResponse } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";

export const STAGES = ["DEFINITIONS", "EMULATION", "OBSERVATION", "FORWARD", "INVERSE", "MERGE", "STABILITY", "EVALUATION", "EXPORT"] as const;
export const STAGE_TERM: Record<(typeof STAGES)[number], TermKey> = {
  DEFINITIONS: "stage.definitions", EMULATION: "stage.emulation", OBSERVATION: "stage.observation", FORWARD: "stage.forward",
  INVERSE: "stage.inverse", MERGE: "stage.merge", STABILITY: "stage.stability", EVALUATION: "stage.evaluation", EXPORT: "stage.export",
};
const LAYER_TERM: Record<string, TermKey> = { F01: "layer.f01", F02: "layer.f02", F03: "layer.f03", F04: "layer.f04", F05: "layer.f05", F06: "layer.f06", F07: "layer.f07" };
const LAYER_VIEW: Record<string, string> = { F01: "TOPOLOGY_GRAPH", F02: "TEMPORAL_STATE_EXPLORER", F03: "TEMPORAL_STATE_EXPLORER",
  F04: "OBSERVATION_INSPECTOR", F05: "FORWARD_SWEEP_INSPECTOR", F06: "STRUCTURAL_METRICS", F07: "SYSTEM_FIELD_OVERVIEW" };

const VIEW_TERM: Record<string, TermKey> = { TOPOLOGY_GRAPH: "view.02", TEMPORAL_STATE_EXPLORER: "view.03", OBSERVATION_INSPECTOR: "view.04",
  FORWARD_SWEEP_INSPECTOR: "view.05", STRUCTURAL_METRICS: "view.09", SYSTEM_FIELD_OVERVIEW: "view.01" };

export interface LayerVM { id: string; term: TermKey; view: string; viewTerm: TermKey; space: string | null; status: string | null }
export function layers(f: FieldsResponse): LayerVM[] {
  return f.manifests.map((m) => ({ id: m.field_id, term: LAYER_TERM[m.field_id] ?? "layer.generic", view: LAYER_VIEW[m.field_id] ?? "SYSTEM_FIELD_OVERVIEW",
    viewTerm: VIEW_TERM[LAYER_VIEW[m.field_id] ?? "SYSTEM_FIELD_OVERVIEW"] ?? "view.01",
    space: m.state_space ?? null, status: m.stage_status?.[0]?.[1] ?? null }));
}

export const STAGE_NUM: Record<(typeof STAGES)[number], string> = { DEFINITIONS: "1", EMULATION: "2", OBSERVATION: "3", FORWARD: "4",
  INVERSE: "5", MERGE: "6", STABILITY: "7", EVALUATION: "8", EXPORT: "9" };
export interface StageVM { stage: (typeof STAGES)[number]; term: TermKey; status: string }
export function pipeline(x: ExperimentView): StageVM[] {
  const st = new Map(x.stage_status.map((s) => [s.stage, s.status] as const));
  return STAGES.map((s) => ({ stage: s, term: STAGE_TERM[s], status: st.get(s) ?? "CREATED" }));
}

export const OPENNESS: readonly [keyof ContentOpenness, TermKey][] = [
  ["undetermined", "openness.undetermined"], ["unknown_observations", "openness.unknown_observations"],
  ["open_references", "openness.open_references"], ["open_relations", "openness.open_relations"],
  ["structural_gaps_open", "openness.structural_gaps_open"], ["unevaluable_rules", "openness.unevaluable_rules"]];

/** View 01 resonance (architecture v2.0.3, 04.4): the static field/stage mapping of the manifests (`stage_status[]`).
 *  A field resonates with its stages, a stage with the fields that list it.
 *  Equality on ids only (TX26). */
export const stageId = (s: string): string => `stage:${s.toLowerCase()}`;
/** Focus ids are StableIds (K-01): field F05 → `field:f05`, stage FORWARD → `stage:forward`. */
export const fieldFocusId = (f: string): string => `field:${f.toLowerCase()}`;
export interface ResonanceVM01 { fields: readonly { id: string; stages: readonly string[] }[] }
export function resonanceVM(f: FieldsResponse | null): ResonanceVM01 {
  return { fields: (f?.manifests ?? []).map((m) => ({ id: fieldFocusId(m.field_id), stages: (m.stage_status ?? []).map((x) => stageId(x[0])) })) };
}
export function resolveResonance(focus: string, vm: ResonanceVM01): readonly string[] {
  return [...new Set(vm.fields.flatMap((f) => (f.id === focus ? f.stages : f.stages.includes(focus) ? [f.id] : [])))];
}
