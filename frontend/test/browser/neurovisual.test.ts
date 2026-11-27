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
