// Demo script as a URL sequence (G05.3, INV-FUN-07): pure navigation, never a POST.
import { sessionUrl, DEFAULT_SESSION, type SessionKey } from "../session";
import type { TermKey } from "../language";
import type { SemId } from "../semiontics";

export interface DemoConfig { baseline: string; recovery: string; comparisonId: string | null }
export interface DemoStep { url: string; narration: TermKey; expect: readonly SemId[] }

export function demoScript(c: DemoConfig): DemoStep[] {
  const s = (patch: Partial<SessionKey>, step: number): string =>
    sessionUrl({ ...DEFAULT_SESSION, experimentId: c.baseline, mode: "presentation", demoStep: step, ...patch });
  return [
    { url: s({ view: "SYSTEM_FIELD_OVERVIEW", tick: 0 }, 1), narration: "demo.1", expect: ["SEM-019", "SEM-020", "SEM-032"] },
    { url: s({ view: "TEMPORAL_STATE_EXPLORER", tick: 1, focus: "attr:n09/state" }, 2), narration: "demo.2", expect: ["SEM-001", "SEM-004", "SEM-034"] },
    { url: s({ view: "TEMPORAL_STATE_EXPLORER", tick: 3, filter: "open" }, 3), narration: "demo.3", expect: ["SEM-006", "SEM-007"] },
    { url: s({ view: "TEMPORAL_STATE_EXPLORER", tick: 5, focus: "attr:n08/state" }, 4), narration: "demo.4", expect: ["SEM-003", "SEM-035"] },
    { url: s({ view: "FORWARD_SWEEP_INSPECTOR", tick: 3 }, 5), narration: "demo.5", expect: ["SEM-027", "SEM-029", "SEM-013"] },
    { url: s({ view: "STRUCTURAL_METRICS", aggregation: "POOLED" }, 6), narration: "demo.6", expect: ["SEM-021"] },
    { url: s({ view: "SCENARIO_COMPARISON", comparisonId: c.comparisonId }, 7), narration: "demo.7", expect: ["SEM-010", "SEM-011", "SEM-021"] },
    { url: s({ view: "SYSTEM_FIELD_OVERVIEW", tick: 5 }, 8), narration: "demo.8", expect: ["SEM-013", "SEM-019"] },
  ];
}

export const DEEP_PATHS: readonly { key: TermKey; views: readonly string[] }[] = [
  { key: "demo.v1", views: ["SYSTEM_FIELD_OVERVIEW", "FORWARD_SWEEP_INSPECTOR"] },
  { key: "demo.v2", views: ["FORWARD_SWEEP_INSPECTOR", "STRUCTURAL_METRICS"] },
  { key: "demo.v3", views: ["STRUCTURAL_METRICS"] },
  { key: "demo.v4", views: ["ARCHITECTURAL_CLOSURE_INSPECTOR", "SCENARIO_COMPARISON"] },
  { key: "demo.v5", views: ["STRUCTURAL_GAP_INSPECTOR", "TOPOLOGY_GRAPH"] },
];
