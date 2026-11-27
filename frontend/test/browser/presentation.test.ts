// @vitest-environment node
// U27 (architecture v2.0.3, 05.9, 05.17, 05.18, 09.11): presentation scale law (V3T13), responsive composition matrix
// (V3T19) and the R11 one-bit coupling between focus and environment (V3T17).
import type { Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { presentationScale } from "../../src/shell/stageAnchor";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "./harness";

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });
const url = (v: string, q = "") => `/exp/${EXP.baseline}/${v}?tick=3${q}`;

describe("[V3T13] presentation scale law: clamp(1, 1.25 × H/1080, 1.25) × standard", () => {
  const sample = (p: Page) => p.evaluate(() => {
    const fs = (sel: string) => { const e = document.querySelector(sel); return e ? parseFloat(getComputedStyle(e).fontSize) : NaN; };
    return { title: fs(".view-title"), rail: fs(".zone-b a span:last-child"), zoneD: fs('[data-zone="D"] .micro'), pipeline: fs('[data-stage] td:nth-child(2)'),
      body: fs(".layer-open") };
  });
  it.each([1080, 900, 800])("H = %i", async (h) => {
    const s = await open(env, url("SYSTEM_FIELD_OVERVIEW"), { width: 1920, height: h });
    await s.waitForTimeout(200);
    const a = await sample(s);
    await s.context().close();
    const p = await open(env, url("SYSTEM_FIELD_OVERVIEW", "&mode=presentation"), { width: 1920, height: h });
    await p.waitForTimeout(200);
    const b = await sample(p);
    await p.context().close();
    const k = presentationScale(h);
    for (const key of Object.keys(a) as (keyof typeof a)[]) {
      expect(Number.isFinite(a[key]), key).toBe(true);
      expect(b[key], `${key}: ${a[key]} × ${k}`).toBeCloseTo(a[key] * k, 1);
    }
  }, 60000);
});

describe("[V3T19] responsive composition matrix (09.11)", () => {
  const STAGES = [[1920, 1080, "reserve", "tall", 1.25], [1600, 900, "reserve", "short", 1.042], [1440, 900, "collapsed", "short", 1.042],
    [1280, 800, "collapsed", "short", 1]] as const;
  const measure = (p: Page) => p.evaluate(() => {
    const zone = document.querySelector<HTMLElement>(".zone-c")!, content = document.querySelector<HTMLElement>(".zone-c-content")!;
    const layers = [...document.querySelectorAll<HTMLElement>(".layer")].map((l) => l.getBoundingClientRect());
    const leaves = [...content.querySelectorAll<HTMLElement>("*")].filter((e) => e.children.length === 0 && e.textContent?.trim() && e.getClientRects().length);
    const clipped = leaves.filter((e) => { const s = getComputedStyle(e); return s.overflow !== "visible" && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1); }).length;
    const lines = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].map((e) => {
      const r = document.createRange(); r.selectNodeContents(e); const tops = new Set([...r.getClientRects()].map((b) => Math.round(b.top))); return tops.size; });
    return { fit: zone.dataset.fit, stage: zone.dataset.stage, body: parseFloat(getComputedStyle(document.querySelector(".shell")!).fontSize),
      overflow: content.scrollHeight - content.clientHeight, rows: layers.length ? new Set(layers.map((b) => b.top < layers[0]!.bottom)).size : 0, clipped,
      labels: [...lines(".state-grid .space-title"), ...lines(".state-grid .cell-term"), ...lines(".state-grid .seam-text")] };
  });
  for (const [w, h, fit, stage, scale] of STAGES) {
    for (const mode of ["standard", "presentation"] as const) {
      it(`${w}×${h} ${mode}: fit ${fit}, ${stage}, views 01/03/09`, async () => {
        for (const v of ["SYSTEM_FIELD_OVERVIEW", "TEMPORAL_STATE_EXPLORER", "STRUCTURAL_METRICS"]) {
          const p = await open(env, url(v, mode === "presentation" ? "&mode=presentation" : ""), { width: w, height: h });
          await p.waitForTimeout(250);
          const r = await measure(p);
          await p.context().close();
          const tag = `${v} ${w}×${h} ${mode}`;
          expect(r.fit, tag).toBe(fit);
          expect(r.stage, tag).toBe(stage);
          expect(r.body, `${tag} scale`).toBeCloseTo(13 * (mode === "presentation" ? scale : 1), 1);
          expect(r.clipped, `${tag} clipped text`).toBe(0);
          if (v !== "STRUCTURAL_METRICS") expect(r.overflow, `${tag} overflow`).toBe(0);
          if (v === "SYSTEM_FIELD_OVERVIEW") expect(r.rows, `${tag} chain rows`).toBe(1);
          if (v === "TEMPORAL_STATE_EXPLORER") for (const n of r.labels) expect(n, `${tag} label lines`).toBe(1);
        }
      }, 120000);
    }
  }
});

describe("[V3T17] R11: the environment reads exactly one bit of the focus field", () => {
  const amb = (p: Page) => p.evaluate(() => {
    const op = (sel: string) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).opacity : "none"; };
    const play = (sel: string) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).animationPlayState : "none"; };
    const anchor = document.querySelector(".ambient")?.getAttribute("data-anchor");
    return JSON.stringify({ reserve: op(".amb-reserve"), light: op(".amb-light"), emblem: play(".amb-emblem"), breath: play(".amb-light-breath"), anchor });
  });
  it("(a) single observations: one state for every active focus (any target, view, tick, resonant set), one for idle", async () => {
    const states = new Map<string, string[]>();
    const obs = async (path: string, label: string) => {
      const p = await open(env, path, { width: 1920, height: 1080 }, "reduce");
      await p.waitForTimeout(600);
      const s = await amb(p);
      const scope = await p.evaluate(() => document.querySelector(".focus-scope")?.getAttribute("data-focus-scope") ?? "none");
      await p.context().close();
      states.set(s, [...(states.get(s) ?? []), `${label}:${scope}`]);
      return { s, scope };
    };
    const idle = await obs(url("TEMPORAL_STATE_EXPLORER"), "03 none");
    const a1 = await obs(url("TEMPORAL_STATE_EXPLORER", "&focus=attr:n08/state"), "03 n08");
    const a2 = await obs(url("TEMPORAL_STATE_EXPLORER", "&focus=attr:n05/state"), "03 n05");
    const a3 = await obs(`/exp/${EXP.baseline}/TEMPORAL_STATE_EXPLORER?tick=4&focus=attr:n08/state`, "03 n08 t4");
    const a4 = await obs(url("TOPOLOGY_GRAPH", "&focus=node:n04"), "02 n04");
    const absent = await obs(url("TOPOLOGY_GRAPH", "&focus=attr:n08/state"), "02 absent");
    expect([a1, a2, a3, a4].map((x) => x.scope)).toEqual(["active", "active", "active", "active"]);
    expect([idle.scope, absent.scope]).toEqual(["idle", "idle"]);
    expect(new Set([a1.s, a2.s, a3.s, a4.s]).size, [...states.values()].join(" | ")).toBe(1);
    expect(absent.s).toBe(idle.s);
    expect(states.size, "exactly two environment states").toBe(2);
    expect(a1.s).not.toBe(idle.s);
  }, 120000);

  it("(b) a sequence acquire → move → release adds no state: release returns to the idle state", async () => {
    const p = await open(env, url("TEMPORAL_STATE_EXPLORER"), { width: 1920, height: 1080 }, "reduce");
    await p.waitForTimeout(400);
    const s0 = await amb(p);
    await p.click('[data-attribute="attr:n08/state"] .focus-handle'); await p.waitForTimeout(600);
    const s1 = await amb(p);
    await p.click('[data-attribute="attr:n05/state"] .focus-handle'); await p.waitForTimeout(600);
    const s2 = await amb(p);
    await p.keyboard.press("Escape"); await p.waitForTimeout(600);
    const s3 = await amb(p);
    await p.context().close();
    expect(s1).toBe(s2);
    expect(s3).toBe(s0);
    expect(s1).not.toBe(s0);
  }, 60000);
});
