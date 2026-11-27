// @vitest-environment node
// Browser checks of the neurovisual generation (architecture v2.0.3, chapter 08): real Chrome, production build,
// projection snapshots. Grows unit by unit (U07 …).
import type { Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "./harness";

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });
const view = (v: string, extra = "") => `/exp/${EXP.baseline}/${v}?tick=3${extra}`;
const lum = (c: string) => { const m = c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map((x) => Number(x) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * m[0]! + 0.7152 * m[1]! + 0.0722 * m[2]!; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]; return (x + 0.05) / (y + 0.05); };

describe("[V2T08][U07] absence carriers", () => {
  it("cell-shaped absence signs sit on surface.void, carry the exempt mark and no running animation or transition", async () => {
    const p: Page = await open(env, view("TEMPORAL_STATE_EXPLORER"));
    const r = await p.evaluate(() => [...document.querySelectorAll('.cell[data-sem="SEM-006"], .cell[data-sem="SEM-007"], .cell[data-sem="SEM-031"]')].map((c) => {
      const s = getComputedStyle(c); return { bg: s.backgroundColor, attn: c.getAttribute("data-attn"), anims: c.getAnimations().length, tr: s.transitionDuration }; }));
    const voidRgb = await p.evaluate(() => { const d = document.createElement("div"); d.style.color = "var(--col-surface-void)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    await p.context().close();
    expect(r.length).toBeGreaterThan(0);
    for (const c of r) { expect(c.bg).toBe(voidRgb); expect(c.attn).toBe("exempt"); expect(c.anims).toBe(0); expect(c.tr).toBe("0s"); }
  }, 60000);
});

describe("[V3T08][U08] loading state keeps text contrast (G3-14)", () => {
  it("the loading mask text is opaque and ≥ 4.5 : 1 on its ground while responses are delayed", async () => {
    const p = await open(env, view("STRUCTURAL_METRICS"), undefined, undefined, { delayMs: 1500, settle: false });
    await p.waitForSelector('[data-state="LOADING"]', { timeout: 10000 });
    const r = await p.evaluate(() => { const m = document.querySelector('[data-state="LOADING"]')!; const t = m.querySelector("span") ?? m;
      let bg = "rgba(0, 0, 0, 0)", el: Element | null = m; while (el && /rgba\(.*, 0\)$|transparent/.test(bg)) { bg = getComputedStyle(el).backgroundColor; el = el.parentElement; }
      if (/rgba\(.*, 0\)$/.test(bg)) bg = getComputedStyle(document.body).backgroundColor;
      return { opacity: getComputedStyle(m).opacity, color: getComputedStyle(t).color, bg }; });
    await p.context().close();
    expect(r.opacity).toBe("1");
    expect(contrast(r.color, r.bg)).toBeGreaterThanOrEqual(4.5);
  }, 60000);
});

describe("[V3T09][U10] depth order inside Zone C (05.5)", () => {
  it.each([["SYSTEM_FIELD_OVERVIEW"], ["TEMPORAL_STATE_EXPLORER"], ["STRUCTURAL_METRICS"]])("%s: one stacking context, decor below content, demo bar never over content", async (v) => {
    const p = await open(env, view(v, "&mode=presentation"), { width: 1440, height: 900 });
    const r = await p.evaluate(() => {
      const z = document.querySelector<HTMLElement>(".zone-c")!, c = z.querySelector<HTMLElement>(".zone-c-content")!;
      const decor = z.querySelector<HTMLElement>(".neural-field, .ambient");
      const demo = z.querySelector<HTMLElement>(".demo-bar"); const cr = c.getBoundingClientRect(), dr = demo?.getBoundingClientRect();
      return { iso: getComputedStyle(z).isolation, decorZ: decor ? Number(getComputedStyle(decor).zIndex) : -1, contentZ: Number(getComputedStyle(c).zIndex),
        overlap: dr ? Math.max(0, Math.min(cr.bottom, dr.bottom) - Math.max(cr.top, dr.top)) : 0 };
    });
    await p.context().close();
    expect(r.iso).toBe("isolate");
    expect(r.decorZ).toBeLessThan(r.contentZ);
    expect(r.overlap).toBe(0);
  }, 60000);
});

const VIEWS_ALL = ["SYSTEM_FIELD_OVERVIEW", "TOPOLOGY_GRAPH", "TEMPORAL_STATE_EXPLORER", "OBSERVATION_INSPECTOR", "FORWARD_SWEEP_INSPECTOR",
  "INVERSE_SWEEP_INSPECTOR", "STRUCTURAL_GAP_INSPECTOR", "ARCHITECTURAL_CLOSURE_INSPECTOR", "STRUCTURAL_METRICS", "EVENT_TIMELINE"];

describe("[V2T04][V3T02][U11–U13] decoration stays beneath data and carries no statement", () => {
  it.each(VIEWS_ALL.map((v) => [v]))("%s: decor is aria-hidden, without data-sem and pointer events; magenta probe never inside a panel or the plot", async (v) => {
    const p = await open(env, view(v), { width: 1440, height: 900 });
    const meta = await p.evaluate(() => { const a = document.querySelector("svg.ambient")!;
      return { hidden: a.getAttribute("aria-hidden"), sem: a.querySelectorAll("[data-sem]").length, pe: getComputedStyle(a).pointerEvents }; });
    expect(meta).toEqual({ hidden: "true", sem: 0, pe: "none" });
    // V3T02: test-only override — decor in pure magenta at full strength; panels and the plot ground must stay free of it
    await p.addStyleTag({ content: ":root { --col-brand-core: #FF00FF !important; } .amb-text, .amb-reserve, .amb-axes line, .amb-light { opacity: 1 !important; } .amb-vignette { display: none; }" });
    await p.waitForTimeout(150);
    const boxes = await p.evaluate(() => [...document.querySelectorAll(".zone-c .panel, .zone-c .metric-card, .zone-c .topology svg, .zone-c .cell")]
      .map((e) => e.getBoundingClientRect()).filter((r) => r.width > 4 && r.height > 4).map((r) => ({ x: r.x + 2, y: r.y + 2, w: r.width - 4, h: r.height - 4 })));
    const png = await p.screenshot({ animations: "disabled" });
    await p.context().close();
    const { PNG } = await import("pngjs"); const img = PNG.sync.read(png);
    let hits = 0;
    for (const b of boxes) for (let y = Math.max(0, Math.floor(b.y)); y < Math.min(img.height, b.y + b.h); y += 2) for (let x = Math.max(0, Math.floor(b.x)); x < Math.min(img.width, b.x + b.w); x += 2) {
      const i = (y * img.width + x) * 4; const r = img.data[i]!, g = img.data[i + 1]!, bl = img.data[i + 2]!;
      if (r > 120 && bl > 120 && g < 60) hits++; }
    expect(hits, "magenta decor pixels inside panels, cells or the plot ground").toBe(0);
  }, 90000);
});

describe("[G3-31][U11] violation-coloured text never sits on decor ground", () => {
  it.each(VIEWS_ALL.map((v) => [v]))("%s: every text run in eval.violation lies inside an opaque block", async (v) => {
    const p = await open(env, view(v), { width: 1440, height: 900 });
    const bad = await p.evaluate(() => {
      const probe = document.createElement("span"); probe.style.color = "var(--col-eval-violation)"; document.body.append(probe); const viol = getComputedStyle(probe).color; probe.remove();
      const out: string[] = [];
      const tw = document.createTreeWalker(document.querySelector(".zone-c-content")!, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const txt = n.nodeValue?.trim() ?? ""; const el = n.parentElement!;
        // glyph marks (single characters, or registered sign glyphs hidden from assistive technology) are graphics: ≥ 3 : 1,
        // which eval.violation keeps over decor at 0.11 (4.20 : 1, V3T01); the rule is about language text
        if (txt.length < 2 || el.closest('[aria-hidden="true"]') || getComputedStyle(el).color !== viol) continue;
        let a: Element | null = el, opaque = false;
        while (a && !a.classList.contains("zone-c-content")) { const bg = getComputedStyle(a).backgroundColor; if (/^rgb\(/.test(bg)) { opaque = true; break; } a = a.parentElement; }
        if (!opaque) out.push(txt.slice(0, 40));
      }
      return out;
    });
    await p.context().close();
    expect(bad).toEqual([]);
  }, 60000);
});
