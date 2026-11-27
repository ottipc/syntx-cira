// @vitest-environment node
// Frame audit (architecture v2.0.3, 08.4) for the motion classes of U19: per animation frame after a trigger, exempt
// carriers (absence, origin, barrier, gate, seam, quarantine) never animate and never change; every text node keeps
// ≥ 4.5 : 1 against its opaque background; running UI animations last at most their class token + one frame; under
// reduced motion the end state is reached in the first frame.
import type { Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MOTION } from "../../src/semiontics/generated/tokens";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "./harness";

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });
const url = (v: string, q = "") => `/exp/${EXP.baseline}/${v}?tick=3${q}`;

/** class token per animation name (05.7); a carried focus frame may use motion.carry */
const TOKEN: Record<string, number> = { "mot-view-entry": MOTION.stage, "mot-focus-lock": MOTION.carry, "mot-focus-lock-svg": MOTION.carry,
  "mot-resonance": MOTION.focus, "mot-resonance-svg": MOTION.focus, "mot-tick-commit": MOTION.tick, "mot-drawer": MOTION.drawer };

interface Audit { frames: number; exemptChanged: string[]; exemptAnimated: string[]; minContrast: number; worst: string; anims: [string, number][]; first: Record<string, string> }

async function audit(p: Page, trigger: string, probe = "", frames = 24): Promise<Audit> {
  return p.evaluate(async ({ trigger, probe, frames }) => {
    const parse = (c: string): [number, number, number, number] | null => {
      let m = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(c);
      if (m) return [+m[1]! / 255, +m[2]! / 255, +m[3]! / 255, m[4] === undefined ? 1 : +m[4]];
      m = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)$/.exec(c);
      return m ? [+m[1]!, +m[2]!, +m[3]!, m[4] === undefined ? 1 : +m[4]] : null;
    };
    const lum = (v: [number, number, number, number]) => { const f = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(v[0]) + 0.7152 * f(v[1]) + 0.0722 * f(v[2]); };
    const bgOf = (e: Element): [number, number, number, number] => {
      for (let x: Element | null = e; x; x = x.parentElement) { const c = parse(getComputedStyle(x).backgroundColor); if (c && c[3] >= 1) return c; }
      return parse(getComputedStyle(document.body).backgroundColor)!;
    };
    const texts = () => [...document.querySelectorAll<HTMLElement>(".zone-c-content *")].filter((e) => e.closest("svg") === null
      && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && e.getClientRects().length > 0);
    const key = (e: Element, i: number) => `${e.getAttribute("data-sem") ?? e.className}#${i}`;
    const sig = (e: Element) => { const s = getComputedStyle(e); return [s.transform, s.opacity, s.color, s.backgroundColor, s.borderTopColor, s.borderLeftColor, s.outlineColor].join("|"); };
    const exempt = () => [...document.querySelectorAll('[data-attn="exempt"]')];
    const start = new Map(exempt().map((e, i) => [key(e, i), sig(e)] as const));
    const out = { frames: 0, exemptChanged: [] as string[], exemptAnimated: [] as string[], minContrast: 99, worst: "", anims: [] as [string, number][], first: {} as Record<string, string> };
    // eslint-disable-next-line no-new-func
    new Function(trigger)();
    for (let f = 0; f < frames; f++) {
      await new Promise((r) => requestAnimationFrame(r));
      out.frames++;
      if (f === 0 && probe) { const el = document.querySelector(probe); if (el) { const s = getComputedStyle(el); out.first = { border: s.borderTopColor, stroke: s.stroke, shadow: s.boxShadow }; } }
      exempt().forEach((e, i) => {
        const k = key(e, i);
        if (e.getAnimations().length) out.exemptAnimated.push(k);
        if (start.has(k) && start.get(k) !== sig(e)) out.exemptChanged.push(k);
      });
      for (const e of texts()) {
        const c = parse(getComputedStyle(e).color); if (!c) continue;
        const b = bgOf(e), [hi, lo] = [lum(c), lum(b)].sort((x, y) => y - x) as [number, number], k = (hi + 0.05) / (lo + 0.05);
        if (k < out.minContrast) { out.minContrast = k; out.worst = `${e.tagName}.${e.className}: ${getComputedStyle(e).color} on ${b.join(",")}`; }
      }
      for (const a of document.getAnimations()) {
        const name = (a as CSSAnimation).animationName ?? "";
        if (name.startsWith("mot-")) out.anims.push([name, Number(a.effect?.getTiming().duration ?? 0)]);
      }
    }
    return out;
  }, { trigger, probe, frames });
}

const checks = (r: Audit, TOK = TOKEN) => {
  expect(r.frames).toBeGreaterThan(10);
  expect([...new Set(r.exemptAnimated)], "exempt carriers carry no animation").toEqual([]);
  expect([...new Set(r.exemptChanged)], "exempt carriers never change").toEqual([]);
  expect(r.minContrast, `text ≥ 4.5 in every frame (${r.worst})`).toBeGreaterThanOrEqual(4.5);
  for (const [n, d] of r.anims) expect(d, `${n} ≤ token + one frame`).toBeLessThanOrEqual((TOK[n] ?? 0) + 17);
};

describe("[U19] frame audit of the motion classes (08.4)", () => {
  it("MOT03 view entry (02 → 03): transform of the view block only", async () => {
    const p = await open(env, url("TOPOLOGY_GRAPH"));
    const r = await audit(p, `document.querySelector('.zone-b a[href*="/TEMPORAL_STATE_EXPLORER"]').click()`);
    await p.context().close();
    checks(r);
    expect(r.anims.some(([n]) => n === "mot-view-entry")).toBe(true);
  }, 60000);

  it("MOT04 + MOT11 focus lock in 03: frame and SEM-038 settle, ink tiers on proven pairs", async () => {
    const p = await open(env, url("TEMPORAL_STATE_EXPLORER"));
    await p.waitForTimeout(250);
    const r = await audit(p, `document.querySelector('[data-attribute="attr:n08/state"] .focus-handle').click()`);
    await p.context().close();
    checks(r);
    expect(new Set(r.anims.map(([n]) => n))).toEqual(new Set(["mot-focus-lock", "mot-resonance"]));
  }, 60000);

  it("MOT04 in an SVG view (02) and in tables (07)", async () => {
    for (const [v, sel] of [["TOPOLOGY_GRAPH", '[data-node="node:n08"]'], ["STRUCTURAL_GAP_INSPECTOR", '[data-focus-id="case:gate_unauthorized"] .focus-handle']] as const) {
      const p = await open(env, url(v));
      await p.waitForTimeout(250);
      const r = await audit(p, `document.querySelector('${sel}').dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
      await p.context().close();
      checks(r);
      expect(r.anims.some(([n]) => n.startsWith("mot-focus-lock")), v).toBe(true);
    }
  }, 90000);

  it("MOT05 tick commit (03, t3 → t4): border confirmation on changed non-absence cells only", async () => {
    const p = await open(env, url("TEMPORAL_STATE_EXPLORER"));
    await p.waitForTimeout(250);
    await p.click('[data-zone="D"] button:has-text("t4")');
    await p.waitForSelector('.state-grid[data-tick-commit]');
    const r = await p.evaluate(() => {
      const a = document.getAnimations().filter((x) => (x as CSSAnimation).animationName === "mot-tick-commit")
        .map((x) => (x.effect as KeyframeEffect).target as Element);
      return { n: a.length, onChanged: a.every((e) => e.closest("[data-changed]") !== null), onExempt: a.filter((e) => e.getAttribute("data-attn") === "exempt").length };
    });
    const again = await audit(p, "", "", 14);
    await p.context().close();
    expect(r.n).toBeGreaterThan(0);
    expect(r.onChanged).toBe(true);
    expect(r.onExempt).toBe(0);
    checks(again);
  }, 60000);

  it("MOT08 drawer: Zone E enters by transform within motion.drawer", async () => {
    const p = await open(env, url("STRUCTURAL_METRICS"));
    await p.waitForTimeout(250);
    const r = await audit(p, `[...document.querySelectorAll('.zone-c-content button')].find((b) => b.getAttribute('data-term') === 'prov.drawer')?.click()`);
    const open_ = await p.evaluate(() => !document.querySelector(".zone-e")?.hasAttribute("hidden"));
    await p.context().close();
    expect(open_).toBe(true);
    checks(r);
    expect(r.anims.some(([n]) => n === "mot-drawer")).toBe(true);
  }, 60000);

  it("reduced motion: the focus frame shows its end state in the first frame; no UI animation runs", async () => {
    const p = await open(env, url("TEMPORAL_STATE_EXPLORER"), { width: 1440, height: 900 }, "reduce");
    await p.waitForTimeout(100);
    const r = await audit(p, `document.querySelector('[data-attribute="attr:n08/state"] .focus-handle').click()`, ".row-frame-focused", 12);
    const ink = await p.evaluate(() => { const d = document.createElement("i"); d.style.color = "var(--col-ink-primary)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    await p.context().close();
    expect(r.first.border).toBe(ink);
    expect(r.anims.filter(([, d]) => d > 0), "every UI animation collapses to 0 ms").toEqual([]);
    checks(r);
  }, 60000);
});

/** V3T14: every SEM-038 carrier on screen renders one solid 1.5 px ink.secondary stroke whose inner edge lies 3 px
 *  outside its host — frame element (box), inflated rect (SVG) or echo frame (::after of the block) */
async function sem038(p: Page) {
  return p.evaluate(() => {
    const ink = (() => { const d = document.createElement("i"); d.style.color = "var(--col-ink-secondary)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; })();
    return [...document.querySelectorAll<Element>('[data-sem="SEM-038"]')].map((e) => {
      if (e instanceof SVGRectElement) {
        const s = getComputedStyle(e), host = e.parentElement!.querySelector<SVGRectElement>(".node-box")!;
        const gap = -Number(e.getAttribute("x")) - 0.75 - Number(getComputedStyle(host).strokeWidth.replace("px", "")) / 2;
        return { kind: "svg", w: s.strokeWidth, c: s.stroke, dash: s.strokeDasharray, gap: Math.round(gap * 100) / 100, ink };
      }
      const echo = e.hasAttribute("data-echo");
      const s = getComputedStyle(e, echo ? "::after" : null);
      const m = /^(rgba?\([^)]*\)) 0px 0px 0px ([\d.]+)px inset$/.exec(s.boxShadow);
      // host: the table row, the focusable box, or — for a row-shaped grid item (view 03) — its row header
      const h = e.closest("tr, [data-focus-id]:not(.contents)") ?? e.closest("[data-attribute]")?.querySelector(".attr") ?? e.parentElement!;
      const host = echo ? e.getBoundingClientRect() : h.getBoundingClientRect();
      const inset = parseFloat(s.top);
      const gap = echo ? -inset - (m ? parseFloat(m[2]!) : 0) : Math.round((host.top - e.getBoundingClientRect().top - (m ? parseFloat(m[2]!) : 0)) * 10) / 10;
      return { kind: echo ? "echo" : "box", w: m ? `${m[2]}px` : s.boxShadow, c: m ? m[1] : "", dash: s.borderTopStyle === "dashed" || s.outlineStyle === "dashed" ? "dashed" : "none", gap, ink };
    });
  });
}
const geometryOk = (xs: Awaited<ReturnType<typeof sem038>>) => {
  for (const x of xs) {
    expect(x.w, `${x.kind} width`).toBe("1.5px");
    expect(x.c, `${x.kind} ink`).toBe(x.ink);
    expect(x.dash, `${x.kind} never dashed`).toBe("none");
    expect(x.gap, `${x.kind} inner edge 3 px outside the host`).toBeCloseTo(3, 0);
  }
};

describe("[U20][V3T14] SEM-038 has one geometry everywhere (focus resonance, SVG, provenance echo)", () => {
  it("views 02, 03, 04, 07 with focus, and the provenance echo in 09", async () => {
    const all: Awaited<ReturnType<typeof sem038>> = [];
    for (const [v, f] of [["TOPOLOGY_GRAPH", "node:n08"], ["TEMPORAL_STATE_EXPLORER", "attr:n08/state"], ["OBSERVATION_INSPECTOR", "src:s01"],
      ["STRUCTURAL_GAP_INSPECTOR", "case:gate_unauthorized"]] as const) {
      const p = await open(env, url(v, `&focus=${encodeURIComponent(f)}`));
      await p.waitForTimeout(300);
      all.push(...await sem038(p));
      await p.context().close();
    }
    const p = await open(env, url("STRUCTURAL_METRICS"));
    await p.click('.zone-c-content button[data-term="prov.drawer"]');
    await p.hover(".echo-source button");
    await p.waitForTimeout(250);
    const echo = await sem038(p);
    const hoverOff = async () => { await p.mouse.move(0, 0); await p.waitForTimeout(50); return p.evaluate(() => document.querySelectorAll("[data-echo]").length); };
    const after = await hoverOff();
    await p.context().close();
    expect(all.some((x) => x.kind === "svg") && all.some((x) => x.kind === "box")).toBe(true);
    expect(echo.filter((x) => x.kind === "echo").length, "the echo frames the blocks drawn from the source").toBeGreaterThan(0);
    geometryOk([...all, ...echo]);
    expect(after, "the echo ends with the hover").toBe(0);
  }, 120000);
});

describe("[U20] frame audit MOT12/15/16/18", () => {
  it("MOT15 overlay chip (02): slots switch instantly, chip border confirms within motion.focus", async () => {
    const p = await open(env, url("TOPOLOGY_GRAPH"));
    await p.waitForTimeout(250);
    const before = await p.evaluate(() => document.querySelectorAll('svg [data-space="O"]').length);
    const r = await audit(p, `document.querySelectorAll('.toolbar button.chip[aria-pressed]')[1].click()`, "", 12);
    const after = await p.evaluate(() => document.querySelectorAll('svg [data-space="O"]').length);
    await p.context().close();
    checks(r);
    expect(before === after, "one overlay was switched in the first frames").toBe(false);
  }, 60000);

  it("MOT16 provenance echo: SEM-038 colour settles within motion.focus; exempt carriers untouched", async () => {
    const p = await open(env, url("STRUCTURAL_METRICS"));
    await p.click('.zone-c-content button[data-term="prov.drawer"]');
    await p.waitForTimeout(250);
    const r = await audit(p, `document.querySelector('.echo-source button').click()`);
    const pinned = await p.evaluate(() => document.querySelectorAll("[data-echo]").length);
    await p.context().close();
    checks(r);
    expect(pinned, "a click pins the echo").toBeGreaterThan(0);
  }, 60000);

  it("MOT18 export: the delivered hash settles in within motion.carry", async () => {
    const p = await open(env, url("STRUCTURAL_METRICS"));
    await p.waitForTimeout(250);
    const r = await audit(p, `document.querySelector('button[data-term="action.export"]').click()`, "", 30);
    const shown = await p.evaluate(() => !!document.querySelector('[data-testid="bundle-hash"]'));
    await p.context().close();
    expect(shown).toBe(true);
    checks(r, { ...TOKEN, "mot-export": MOTION.carry });
    expect(r.anims.some(([n]) => n === "mot-export")).toBe(true);
  }, 60000);

  it("MOT12 demo cadence: a demo step change runs only view entry / focus / carry, each ≤ 200 ms", async () => {
    const p = await open(env, url("SYSTEM_FIELD_OVERVIEW"));
    await p.waitForTimeout(250);
    const r = await audit(p, `document.querySelector('.demo-bar button[data-term="action.resume_demo"], .demo-bar button[data-term="action.next"]').click()`, "", 20);
    await p.context().close();
    checks(r);
    for (const [n, d] of r.anims) { expect(["mot-view-entry", "mot-focus-lock", "mot-focus-lock-svg", "mot-resonance", "mot-resonance-svg"]).toContain(n); expect(d).toBeLessThanOrEqual(200); }
  }, 60000);
});

describe("[V2T09] reduced motion: same text and signs, nothing running", () => {
  const VIEWS = ["SYSTEM_FIELD_OVERVIEW", "TOPOLOGY_GRAPH", "TEMPORAL_STATE_EXPLORER", "OBSERVATION_INSPECTOR", "FORWARD_SWEEP_INSPECTOR",
    "INVERSE_SWEEP_INSPECTOR", "STRUCTURAL_GAP_INSPECTOR", "ARCHITECTURAL_CLOSURE_INSPECTOR", "STRUCTURAL_METRICS", "EVENT_TIMELINE"];
  it.each(VIEWS)("%s", async (v) => {
    const dom = (p: Page) => p.evaluate(() => ({ text: document.querySelector(".zone-c-content")!.textContent!.replace(/\s+/g, " ").trim(),
      sems: [...document.querySelectorAll("[data-sem]")].map((e) => e.getAttribute("data-sem")).join(","), running: document.getAnimations().filter((a) => a.playState === "running").length }));
    const n = await open(env, url(v));
    await n.waitForTimeout(400);
    const a = await dom(n);
    await n.context().close();
    const r = await open(env, url(v), { width: 1440, height: 900 }, "reduce");
    await r.waitForTimeout(400);
    const b = await dom(r);
    await r.context().close();
    expect(b.text).toBe(a.text);
    expect(b.sems).toBe(a.sems);
    expect(b.running, "no running animation under reduced motion").toBe(0);
  }, 60000);
});

describe("[V2T18] 10 s with the ambient field active: absence, provenance, barrier and seam never mutate; no looping animation on a sign", () => {
  it.each(["SYSTEM_FIELD_OVERVIEW", "TEMPORAL_STATE_EXPLORER"])("%s", async (v) => {
    // the software renderer would trip the frame budget (correctly → static); a steady rAF clock keeps the field active
    const p = await open(env, url(v), { width: 1440, height: 900 }, "no-preference", { initScript: "steady-frames" });
    await p.waitForTimeout(300);
    const r = await p.evaluate(async () => {
      const nodes = [...document.querySelectorAll('[data-attn="exempt"]')];
      const sig = (e: Element) => { const s = getComputedStyle(e); return [s.transform, s.opacity, s.color, s.backgroundColor, s.borderTopColor, s.outlineColor].join("|"); };
      const start = nodes.map(sig);
      let muts = 0;
      const mo = new MutationObserver((rs) => { muts += rs.length; });
      nodes.forEach((n) => mo.observe(n, { attributes: true, childList: true, characterData: true, subtree: true }));
      const changed = new Set<number>();
      const t0 = performance.now();
      while (performance.now() - t0 < 10000) { await new Promise((res) => setTimeout(res, 250)); nodes.forEach((n, i) => { if (sig(n) !== start[i]) changed.add(i); }); }
      mo.disconnect();
      const looping = document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity)
        .map((a) => (a.effect as KeyframeEffect).target as Element).filter((t) => t.closest("[data-sem]") !== null).length;
      return { n: nodes.length, muts, changed: changed.size, ambient: document.querySelector(".zone-c")!.getAttribute("data-ambient"), looping };
    });
    await p.context().close();
    expect(r.ambient).toBe("active");
    expect(r.n).toBeGreaterThan(0);
    expect(r.muts).toBe(0);
    expect(r.changed).toBe(0);
    expect(r.looping).toBe(0);
  }, 60000);
});

describe("[U21] MOT17 scrub ring", () => {
  it("the ring moves by transform within motion.scrub; exempt carriers untouched; snaps on rapid change", async () => {
    const p = await open(env, url("TOPOLOGY_GRAPH"));
    await p.waitForTimeout(300);
    const t = await p.evaluate(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      await new Promise((r) => requestAnimationFrame(r)); await new Promise((r) => requestAnimationFrame(r));
      const ring = document.querySelector(".tick-ring")!;
      const tr = ring.getAnimations().map((a) => [(a as CSSTransition).transitionProperty, Number(a.effect?.getTiming().duration ?? 0)] as const);
      // rapid change: a second step while the first runs restarts from the current position, one transition per property
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      await new Promise((r) => requestAnimationFrame(r));
      return { tr, during: ring.getAnimations().length };
    });
    const r = await audit(p, `window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))`, "", 14);
    await p.context().close();
    expect(t.tr.some(([prop, d]) => prop === "transform" && d === MOTION.scrub)).toBe(true);
    expect(t.during).toBeLessThanOrEqual(2);
    checks(r);
  }, 60000);
});

describe("[U22] MOT09 metric confirmation", () => {
  it("a new verified scope draws every bar at its final width in the first frame; only the end cap confirms (≤ motion.tick)", async () => {
    const p = await open(env, url("STRUCTURAL_METRICS"));
    await p.waitForTimeout(400);
    const r = await p.evaluate(async () => {
      const btn = [...document.querySelectorAll<HTMLButtonElement>(".zone-c-content .chip")].find((b) => b.getAttribute("aria-pressed") === "false" || b.getAttribute("aria-selected") === "false");
      btn!.click();
      // wait for the new scope's block to commit
      for (let i = 0; i < 200 && !document.querySelector('[data-motion="entering"] .rational-bar'); i++) await new Promise((res) => requestAnimationFrame(res));
      const w = () => [...document.querySelectorAll<HTMLElement>(".bar-fill")].map((f) => Math.round(f.getBoundingClientRect().width));
      const first = w();
      const caps = document.getAnimations().filter((a) => (a as CSSAnimation).animationName === "mot-metric-confirm").map((a) => Number(a.effect?.getTiming().duration));
      const others = document.getAnimations().filter((a) => ((a.effect as KeyframeEffect).target as Element)?.closest?.(".rational-bar") && (a as CSSAnimation).animationName !== "mot-metric-confirm").length;
      await new Promise((res) => setTimeout(res, 300));
      return { first, last: w(), caps, others };
    });
    await p.context().close();
    expect(r.first.length).toBeGreaterThan(0);
    expect(r.first, "no growing bar (INV2-18)").toEqual(r.last);
    expect(r.caps.length).toBeGreaterThan(0);
    for (const d of r.caps) expect(d).toBe(MOTION.tick);
    expect(r.others).toBe(0);
  }, 60000);
});
