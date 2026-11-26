// Demo script as a URL sequence (G05.3, INV-FUN-07): pure navigation, never a POST. The steps are data
// (demo.steps.json), shared with the backend demo-flow test that verifies every narrated claim (AK-11).
import { sessionUrl, DEFAULT_SESSION, type SessionKey, type ViewKey } from "../session";
import type { TermKey } from "../language";
import type { SemId } from "../semiontics";
import STEPS from "./demo.steps.json";

/** Hands-free playback: each step stays this long on screen (demo.steps.json). */
export const SECONDS_PER_STEP: number = STEPS.seconds_per_step;

export interface DemoConfig { baseline: string; recovery: string; comparisonId: string | null }
export interface DemoStep { url: string; narration: TermKey; expect: readonly SemId[] }

interface RawStep { n: number; view: string; tick: number; focus?: string; filter?: string; aggregation?: string; comparison?: boolean;
  narration: string; expect: string[] }

export function demoScript(c: DemoConfig): DemoStep[] {
  return (STEPS.steps as RawStep[]).map((s) => {
    const patch: Partial<SessionKey> = { view: s.view as ViewKey, tick: s.tick, focus: s.focus ?? null, filter: s.filter ?? null,
      aggregation: (s.aggregation as SessionKey["aggregation"]) ?? null, comparisonId: s.comparison ? c.comparisonId : null };
    return { url: sessionUrl({ ...DEFAULT_SESSION, experimentId: c.baseline, mode: "presentation", demoStep: s.n, ...patch }),
             narration: s.narration as TermKey, expect: s.expect as SemId[] };
  });
}

export const DEEP_PATHS: readonly { key: TermKey; views: readonly string[] }[] = [
  { key: "demo.v1", views: ["SYSTEM_FIELD_OVERVIEW", "FORWARD_SWEEP_INSPECTOR"] },
  { key: "demo.v2", views: ["FORWARD_SWEEP_INSPECTOR", "STRUCTURAL_METRICS"] },
  { key: "demo.v3", views: ["STRUCTURAL_METRICS"] },
  { key: "demo.v4", views: ["ARCHITECTURAL_CLOSURE_INSPECTOR", "SCENARIO_COMPARISON"] },
  { key: "demo.v5", views: ["STRUCTURAL_GAP_INSPECTOR", "TOPOLOGY_GRAPH"] },
];
