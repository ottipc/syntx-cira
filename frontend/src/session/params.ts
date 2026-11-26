// F07.1 Session — URL ↔ SessionKey (D-20, G03.7). The URL is the single source of session state (INV-STR-01).
export const VIEW_IDS = [
  "SYSTEM_FIELD_OVERVIEW", "TOPOLOGY_GRAPH", "TEMPORAL_STATE_EXPLORER", "OBSERVATION_INSPECTOR",
  "FORWARD_SWEEP_INSPECTOR", "INVERSE_SWEEP_INSPECTOR", "STRUCTURAL_GAP_INSPECTOR", "ARCHITECTURAL_CLOSURE_INSPECTOR",
  "STRUCTURAL_METRICS", "SCENARIO_COMPARISON", "EVENT_TIMELINE",
] as const;
export type ViewKey = (typeof VIEW_IDS)[number];
export type AggregationKey = "POOLED" | "PER_TICK" | "TIME_MEAN_EXPLICIT";

export interface SessionKey {
  experimentId: string | null;
  view: ViewKey;
  tick: number;
  attempt: number;
  revision: number | null;
  comparisonId: string | null;
  aggregation: AggregationKey | null;
  toTick: number | null;
  from: number | null;
  to: number | null;
  focus: string | null;
  filter: string | null;
  lang: "en" | "de";
  mode: "standard" | "presentation";
  demoStep: number | null;
}

export const DEFAULT_SESSION: SessionKey = {
  experimentId: null, view: "SYSTEM_FIELD_OVERVIEW", tick: 0, attempt: 0, revision: null, comparisonId: null,
  aggregation: null, toTick: null, from: null, to: null, focus: null, filter: null, lang: "en", mode: "standard",
  demoStep: null,
};

const STABLE_ID = /^[a-z]+:[a-z0-9][a-z0-9_.:/\-]{0,190}$/;

function nat(v: string | null): number | null {
  if (v === null || !/^\d{1,6}$/.test(v)) return null;
  return Number(v);
}

export function parseSession(pathname: string, search: string): SessionKey {
  const q = new URLSearchParams(search);
  const m = /^\/exp\/([^/]+)\/([A-Z_]+)\/?$/.exec(pathname);
  const exp = m ? decodeURIComponent(m[1] ?? "") : null;
  const view = m && (VIEW_IDS as readonly string[]).includes(m[2] ?? "") ? (m[2] as ViewKey) : DEFAULT_SESSION.view;
  const agg = q.get("aggregation");
  const id = (k: string) => {
    const v = q.get(k);
    return v !== null && STABLE_ID.test(v) ? v : null;
  };
  return {
    experimentId: exp !== null && STABLE_ID.test(exp) ? exp : null,
    view,
    tick: nat(q.get("tick")) ?? 0,
    attempt: nat(q.get("attempt")) ?? 0,
    revision: nat(q.get("revision")),
    comparisonId: id("comparisonId"),
    aggregation: agg === "POOLED" || agg === "PER_TICK" || agg === "TIME_MEAN_EXPLICIT" ? agg : null,
    toTick: nat(q.get("toTick")),
    from: nat(q.get("from")),
    to: nat(q.get("to")),
    focus: id("focus"),
    filter: ["all", "changed", "open", "differs", "observable"].includes(q.get("filter") ?? "") ? q.get("filter") : null,
    lang: q.get("lang") === "de" ? "de" : "en",
    mode: q.get("mode") === "presentation" ? "presentation" : "standard",
    demoStep: nat(q.get("demoStep")),
  };
}

export function sessionUrl(s: SessionKey): string {
  if (s.experimentId === null) {
    const q = new URLSearchParams();
    if (s.lang !== "en") q.set("lang", s.lang);
    if (s.mode !== "standard") q.set("mode", s.mode);
    const qs = q.toString();
    return qs ? `/?${qs}` : "/";
  }
  const q = new URLSearchParams();
  q.set("tick", String(s.tick));
  if (s.attempt) q.set("attempt", String(s.attempt));
  if (s.revision !== null) q.set("revision", String(s.revision));
  if (s.comparisonId) q.set("comparisonId", s.comparisonId);
  if (s.aggregation) q.set("aggregation", s.aggregation);
  if (s.toTick !== null) q.set("toTick", String(s.toTick));
  if (s.from !== null) q.set("from", String(s.from));
  if (s.to !== null) q.set("to", String(s.to));
  if (s.focus) q.set("focus", s.focus);
  if (s.filter) q.set("filter", s.filter);
  if (s.lang !== "en") q.set("lang", s.lang);
  if (s.mode !== "standard") q.set("mode", s.mode);
  if (s.demoStep !== null) q.set("demoStep", String(s.demoStep));
  return `/exp/${s.experimentId}/${s.view}?${q.toString()}`;
}
