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

describe("[V3T07][U11] ambient governor (05.6.3)", () => {
  const state = (p: Page) => p.evaluate(() => document.querySelector<HTMLElement>(".zone-c")!.dataset.ambient);
  it("active at rest; suspended on hidden tab, open modal and quarantine; back to active when they end", async () => {
    const p = await open(env, view("SYSTEM_FIELD_OVERVIEW"));
    await p.waitForTimeout(400);
    expect(await state(p)).toBe("active");
    await p.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
    await p.waitForTimeout(200); expect(await state(p)).toBe("suspended");
    await p.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
    await p.waitForTimeout(200); expect(await state(p)).toBe("active");
    await p.evaluate(() => { const d = document.createElement("div"); d.setAttribute("role", "dialog"); d.id = "t-modal"; document.body.append(d); });
    await p.waitForTimeout(200); expect(await state(p)).toBe("suspended");
    await p.evaluate(() => document.getElementById("t-modal")!.remove());
    await p.waitForTimeout(200); expect(await state(p)).toBe("active");
    await p.evaluate(() => { const q = document.createElement("div"); q.dataset.state = "VIEW_DATA_UNAVAILABLE"; q.id = "t-q"; document.querySelector(".zone-c-content")!.append(q); });
    await p.waitForTimeout(200); expect(await state(p)).toBe("suspended");
    await p.context().close();
  }, 60000);
  it("an exceeded frame budget (p95 > 33.3 ms over 120 frames) makes the environment static for the session", async () => {
    const p = await open(env, view("SYSTEM_FIELD_OVERVIEW"), undefined, undefined, { initScript: "slow-frames" });
    await p.waitForFunction(() => document.querySelector<HTMLElement>(".zone-c")?.dataset.ambient === "static", undefined, { timeout: 20000 });
    expect(await state(p)).toBe("static");
    await p.context().close();
  }, 60000);
});

describe("[V2T19][V3T14][V2T18][U15] view 03 focus field", () => {
  it("one focused row with a 2-px ink.primary frame; co-read rows carry SEM-038 at 1.5 px / 3 px; others attenuated; absence untouched", async () => {
    const p = await open(env, view("TEMPORAL_STATE_EXPLORER"), { width: 1920, height: 1080 });
    const sig = () => p.evaluate(() => [...document.querySelectorAll('.cell[data-attn="exempt"]')].map((c) => { const s = getComputedStyle(c);
      return [s.backgroundColor, s.backgroundImage, s.color, s.borderLeft, s.outlineStyle, s.transform, s.opacity].join("|"); }).join("\n"));
    const before = await sig();
    await p.evaluate(() => { (window as unknown as { __m: number }).__m = 0; const mo = new MutationObserver((r) => { (window as unknown as { __m: number }).__m += r.length; });
      document.querySelectorAll('.cell[data-attn="exempt"]').forEach((c) => mo.observe(c, { attributes: true, attributeFilter: ["style", "class"] })); });
    await p.click('[data-attribute="attr:n08/state"] .focus-handle');
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const rows = [...document.querySelectorAll<HTMLElement>("[data-attribute]")];
      const frame = document.querySelector(".row-frame-focused")!, fs = getComputedStyle(frame);
      const res = [...document.querySelectorAll<HTMLElement>('[data-sem="SEM-038"]')];
      const host = (el: Element) => el.closest("[data-attribute]")!.querySelector(".attr")!.getBoundingClientRect();
      return {
        scope: document.querySelector(".focus-scope")!.getAttribute("data-focus-scope"),
        url: new URL(location.href).searchParams.get("focus"),
        focused: rows.filter((x) => x.dataset.focusState === "focused").map((x) => x.dataset.attribute),
        resonant: rows.filter((x) => x.dataset.focusState === "resonant").map((x) => x.dataset.attribute),
        attenuated: rows.filter((x) => x.dataset.focusState === "attenuated").length,
        frame: { w: fs.borderTopWidth, style: fs.borderTopStyle, c: fs.borderTopColor },
        res: res.map((e) => { const s = getComputedStyle(e), b = e.getBoundingClientRect(), h = host(e);
          const m = /^(rgba?\([^)]*\)) 0px 0px 0px ([\d.]+)px inset$/.exec(s.boxShadow);
          const w = m ? parseFloat(m[2] ?? "") : NaN;
          return { w: `${w}px`, style: m ? "solid" : s.boxShadow, c: m?.[1] ?? "", gap: Math.round((h.top - b.top - w) * 10) / 10 }; }),
        ink: (() => { const d = document.createElement("i"); d.style.color = "var(--col-ink-secondary)"; document.body.append(d); const c = getComputedStyle(d).color;
          d.style.color = "var(--col-ink-primary)"; const c2 = getComputedStyle(d).color; d.remove(); return { secondary: c, primary: c2 }; })(),
        opacity: [...document.querySelectorAll<HTMLElement>(".zone-c-content *")].filter((e) => e.childNodes.length && getComputedStyle(e).opacity !== "1" && e.textContent?.trim()).length,
        mut: (window as unknown as { __m: number }).__m,
      };
    });
    const after = await sig();
    await p.context().close();
    expect(r.scope).toBe("active");
    expect(r.url).toBe("attr:n08/state");
    expect(r.focused).toEqual(["attr:n08/state"]);
    expect(r.resonant.length).toBeGreaterThan(0);
    expect(r.attenuated).toBeGreaterThan(0);
    expect(r.frame).toEqual({ w: "2px", style: "solid", c: r.ink.primary });
    for (const x of r.res) { expect(x.w).toBe("1.5px"); expect(x.style).toBe("solid"); expect(x.c).toBe(r.ink.secondary); expect(x.gap).toBeCloseTo(3, 0); }
    expect(r.opacity, "no text-bearing element below opacity 1 (INV2-21)").toBe(0);
    expect(r.mut, "absence carriers: no style/class mutation").toBe(0);
    expect(after).toBe(before);
  }, 60000);
});
