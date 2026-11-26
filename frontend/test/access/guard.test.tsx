// TX27 / T09 — guard matrix (G03.14, K-58): every guard class and every mirrored parameter; mismatch ⇒ quarantine
// without old data; NOT_AVAILABLE_AT_TICK is content, not an error (stays READY). REQ-055, REQ-056, AK-GUI-02.
import { act, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { checkHeader, ep, type Spec } from "../../src/access";
import { DEFAULT_SESSION, type SessionKey } from "../../src/session";
import { newServer, renderAt, settle, workspace } from "../helpers/render";
import { canon, CMP, EXP, snapshot } from "../helpers/snapshots";

type J = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const S = (p: Partial<SessionKey>): SessionKey => ({ ...DEFAULT_SESSION, experimentId: EXP.baseline, tick: 3, ...p });

/** One spec per endpoint builder and guard class, as the app builds them. */
const SPECS: [string, Spec][] = [
  ["experiments", ep.experiments()], ["experiment", ep.experiment(S({}))],
  ["topology", ep.topology(S({}))], ["states", ep.states(S({}))], ["observations", ep.observations(S({}))],
  ["results:merged", ep.results(S({}), "merged")], ["results:forward", ep.results(S({}), "forward")],
  ["results:attempt1", ep.results(S({ tick: 5, attempt: 1 }), "inverse")],
  ["governance:R", ep.governance(S({}), "R")], ["metrics:per_tick", ep.metricsTick(S({}))],
  ["metrics:pooled", ep.metrics(S({ aggregation: "POOLED" }))], ["metrics:pooled_to", ep.metrics(S({ aggregation: "POOLED", toTick: 2 }))],
  ["metrics:time_mean", ep.metrics(S({ aggregation: "TIME_MEAN_EXPLICIT", toTick: 4 }))],
  ["events", ep.events(S({}))], ["events:range", ep.events(S({ from: 0, to: 2 }))], ["trace:fwd", ep.trace(S({}), "fwd")],
  ["fields:timed", ep.fields(S({}))], ["fields:timeless", ep.fields(S({}), false)], ["comparisons", ep.comparisons(S({ experimentId: null }))],
  ["comparison", ep.comparison(S({ comparisonId: CMP }))],
];

describe("[TX27][T09][REQ-055][AK-GUI-02] header guard matrix", () => {
  it("[TX27] covers all five guard classes", () => {
    expect(new Set(SPECS.map(([, s]) => s.expect.guard))).toEqual(new Set(["GLOBAL", "TIMELESS", "TIMED", "RANGE", "COMPARISON"]));
  });
  it.each(SPECS)("[TX27][T09] %s: real snapshot passes; every mirrored parameter mismatch fails", (_n, spec) => {
    const body = snapshot<J>(spec.url);
    expect(checkHeader(body.header, spec.expect)).toEqual({ ok: true });
    const h = body.header;
    const mutations: [string, J][] = [["guard_class", { ...h, guard_class: h.guard_class === "TIMED" ? "TIMELESS" : "TIMED" }]];
    if (spec.expect.guard !== "GLOBAL" && spec.expect.guard !== "COMPARISON") mutations.push(["experiment_id", { ...h, experiment_id: EXP.recovery }]);
    if (spec.expect.guard === "TIMED") mutations.push(["tick", { ...h, tick: (h.tick as number) + 1 }]);
    if (["TIMELESS", "RANGE", "COMPARISON"].includes(spec.expect.guard)) mutations.push(["tick(present)", { ...h, tick: 0 }]);
    for (const k of Object.keys(spec.expect.echo)) {
      const cur = h.query_echo[k];
      const other = typeof cur === "number" ? cur + 1 : cur === null ? (k === "comparison_id" ? "cmp:other" : 7) : `${cur}_x`;
      mutations.push([`echo.${k}`, { ...h, query_echo: { ...h.query_echo, [k]: other } }]);
    }
    mutations.push(["missing", undefined]);
    for (const [what, mh] of mutations) {
      const g = checkHeader(mh, spec.expect);
      expect(g.ok, `${what} must fail`).toBe(false);
    }
  });
});

describe("[TX27][T09][REQ-056] quarantine without stale data and reload", () => {
  it("[TX27][REQ-056] a states header for another tick quarantines the block; reload after recovery shows the right tick", async () => {
    const server = newServer();
    const key = canon(`/experiments/${EXP.baseline}/states?tick=3`);
    server.override.set(key, (b: J) => ({ ...b, header: { ...b.header, tick: 2 } }));
    const r = await renderAt(`/exp/${EXP.baseline}/TEMPORAL_STATE_EXPLORER?tick=3`, server);
    const w = workspace(r.root);
    expect(w.querySelector('[data-sem="SEM-028"]')).not.toBeNull();
    expect(w.querySelectorAll("[data-attribute]").length, "no values of the wrong tick").toBe(0);
    expect(w.textContent).toContain("tick");
    server.override.delete(key);
    await act(async () => { fireEvent.click(w.querySelector('[data-sem="SEM-028"] button')!); });
    await settle(r.root, r.client);
    expect(w.querySelector('[data-sem="SEM-028"]')).toBeNull();
    expect(w.querySelectorAll("[data-attribute]").length).toBe(snapshot<J>(`/experiments/${EXP.baseline}/states?tick=3`).values.length);
  });

  it.each([["direction", "results?tick=3&attempt=0&direction=forward", "FORWARD_SWEEP_INSPECTOR"],
           ["aggregation", "metrics?aggregation=POOLED", "STRUCTURAL_METRICS"],
           ["experiment", "topology", "TOPOLOGY_GRAPH"]] as const)(
    "[TX27] a %s mismatch quarantines the view block", async (what, path, view) => {
      const server = newServer();
      const key = canon(`/experiments/${EXP.baseline}/${path}`);
      server.override.set(key, (b: J) => what === "experiment" ? { ...b, header: { ...b.header, experiment_id: EXP.recovery } }
        : { ...b, header: { ...b.header, query_echo: { ...b.header.query_echo, [what]: what === "direction" ? "inverse" : "PER_TICK" } } });
      const r = await renderAt(`/exp/${EXP.baseline}/${view}?tick=3${view === "STRUCTURAL_METRICS" ? "&aggregation=POOLED" : ""}`, server);
      expect(workspace(r.root).querySelector('[data-sem="SEM-028"]')).not.toBeNull();
    });

  it("[TX27][K-24] NOT_AVAILABLE_AT_TICK stays READY (content, not error)", async () => {
    for (const view of ["FORWARD_SWEEP_INSPECTOR", "INVERSE_SWEEP_INSPECTOR", "ARCHITECTURAL_CLOSURE_INSPECTOR", "TEMPORAL_STATE_EXPLORER"]) {
      const r = await renderAt(`/exp/${EXP.sparse}/${view}?tick=2`);
      const w = workspace(r.root);
      expect(w.querySelector('[data-sem="SEM-028"]'), view).toBeNull();
      expect(w.querySelector('[data-sem="SEM-009"]'), view).not.toBeNull();
      expect(w.querySelector('[data-state="READY"]'), view).not.toBeNull();
    }
  });
});

describe("[T09][REQ-055] one session reference: tick change is synchronous across blocks", () => {
  it("[T09] stepping the tick masks every timed block immediately, then all show the new tick", async () => {
    const r = await renderAt(`/exp/${EXP.baseline}/TEMPORAL_STATE_EXPLORER?tick=3`);
    const next = r.root.querySelector('[data-zone="D"] [data-term="ui.next_sweep"], [data-zone="D"] button[aria-label*="next" i]');
    await act(async () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" })); });
    expect(new URL(window.location.href).searchParams.get("tick")).toBe("4");
    expect(workspace(r.root).querySelector('[data-state="LOADING"]'), "masked until verified").not.toBeNull();
    await settle(r.root, r.client);
    const st = snapshot<J>(`/experiments/${EXP.baseline}/states?tick=4`);
    for (const v of st.values) {
      if (v.applicability === "APPLICABLE") expect(r.root.querySelector(`[data-attribute="${v.attribute_ref}"] .cell-a`)!.textContent).toContain(v.value);
    }
    expect(r.server.misses).toEqual([]);
    void next;
  });
});
