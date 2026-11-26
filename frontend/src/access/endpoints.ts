// URL construction from the SessionKey (G03.7, GK-27, INV-FUN-05). No other sub-field knows URLs (G03.6).
import type { SessionKey } from "../session";
import type { Expectation } from "./guard";
import { buildPath } from "./client";

export interface Spec { key: string; url: string; expect: Expectation }

const exp = (s: SessionKey) => s.experimentId ?? "";
const base = (s: SessionKey) => `/experiments/${exp(s)}`;

export const ep = {
  scenarios: (): Spec => ({ key: "scenarios", url: "/scenarios", expect: { guard: "GLOBAL", experimentId: null, tick: null, echo: {} } }),
  experiments: (): Spec => ({ key: "experiments", url: "/experiments", expect: { guard: "GLOBAL", experimentId: null, tick: null, echo: {} } }),
  experiment: (s: SessionKey): Spec => ({ key: "experiment", url: base(s),
    expect: { guard: "TIMELESS", experimentId: s.experimentId, tick: null, echo: {} } }),
  topology: (s: SessionKey): Spec => ({ key: "topology", url: `${base(s)}/topology`,
    expect: { guard: "TIMELESS", experimentId: s.experimentId, tick: null, echo: {} } }),
  states: (s: SessionKey, tick = s.tick): Spec => ({ key: "states", url: buildPath(`${base(s)}/states`, { tick }),
    expect: { guard: "TIMED", experimentId: s.experimentId, tick, echo: {} } }),
  observations: (s: SessionKey): Spec => ({ key: "observations",
    url: buildPath(`${base(s)}/observations`, { tick: s.tick, revision: s.revision }),
    expect: { guard: "TIMED", experimentId: s.experimentId, tick: s.tick, echo: { revision: s.revision } } }),
  results: (s: SessionKey, direction: "forward" | "inverse" | "merged" | null = null): Spec => ({ key: `results:${direction}`,
    url: buildPath(`${base(s)}/results`, { tick: s.tick, attempt: s.attempt, direction }),
    expect: { guard: "TIMED", experimentId: s.experimentId, tick: s.tick, echo: { attempt: s.attempt, direction } } }),
  governance: (s: SessionKey, space: "A" | "O" | "R"): Spec => ({ key: `governance:${space}`,
    url: buildPath(`${base(s)}/governance`, { tick: s.tick, space }),
    expect: { guard: "TIMED", experimentId: s.experimentId, tick: s.tick, echo: { direction: space } } }),
  metricsTick: (s: SessionKey): Spec => ({ key: "metrics:tick",
    url: buildPath(`${base(s)}/metrics`, { aggregation: "PER_TICK", tick: s.tick }),
    expect: { guard: "TIMED", experimentId: s.experimentId, tick: s.tick, echo: { aggregation: "PER_TICK", to_tick: null } } }),
  metrics: (s: SessionKey): Spec => {
    const agg = s.aggregation ?? "POOLED";
    if (agg === "PER_TICK") return ep.metricsTick(s);
    return { key: "metrics", url: buildPath(`${base(s)}/metrics`, { aggregation: agg, to_tick: s.toTick }),
      expect: { guard: "RANGE", experimentId: s.experimentId, tick: null, echo: { aggregation: agg, to_tick: s.toTick } } };
  },
  events: (s: SessionKey): Spec => ({ key: "events", url: buildPath(`${base(s)}/events`, { from: s.from, to: s.to }),
    expect: { guard: "RANGE", experimentId: s.experimentId, tick: null, echo: { from: s.from, to: s.to } } }),
  trace: (s: SessionKey, dir: "fwd" | "inv"): Spec => ({ key: `trace:${dir}`,
    url: `${base(s)}/results/sweep:${dir}:t${s.tick}:a${s.attempt}/trace`,
    expect: { guard: "TIMED", experimentId: s.experimentId, tick: s.tick,
      echo: { attempt: s.attempt, direction: dir === "fwd" ? "forward" : "inverse" } } }),
  fields: (s: SessionKey, withTick = true): Spec => ({ key: `fields:${withTick}`,
    url: buildPath("/fields", { experiment_id: s.experimentId, tick: withTick ? s.tick : null }),
    expect: { guard: s.experimentId === null ? "GLOBAL" : withTick ? "TIMED" : "TIMELESS", experimentId: s.experimentId,
      tick: withTick ? s.tick : null, echo: {} } }),
  comparison: (s: SessionKey): Spec => ({ key: "comparison", url: `/comparisons/${s.comparisonId ?? ""}`,
    expect: { guard: "COMPARISON", experimentId: null, tick: null, echo: { comparison_id: s.comparisonId } } }),
  comparisons: (s: SessionKey): Spec => ({ key: "comparisons", url: buildPath("/comparisons", { experiment_id: s.experimentId }),
    expect: { guard: "GLOBAL", experimentId: null, tick: null, echo: {} } }),
  exportBundle: (s: SessionKey): string => `${base(s)}/export`,
};
