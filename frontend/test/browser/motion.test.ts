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
