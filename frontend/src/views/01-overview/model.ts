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

export interface LayerVM { id: string; term: TermKey; view: string; space: string | null; status: string | null }
export function layers(f: FieldsResponse): LayerVM[] {
  return f.manifests.map((m) => ({ id: m.field_id, term: LAYER_TERM[m.field_id] ?? "layer.generic", view: LAYER_VIEW[m.field_id] ?? "SYSTEM_FIELD_OVERVIEW",
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
