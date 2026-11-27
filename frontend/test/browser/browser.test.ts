// @vitest-environment node
// TX28 geometry, TX29 visual regression, TX32 accessibility — real Chrome against the production build (DEP-07b measured).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { VIEW_IDS } from "../../src/session";
import { ZONE } from "../../src/semiontics/generated/tokens";
import { CMP, EXP } from "../helpers/snapshots";
import { consoleErrors, type Env, open, start, stop } from "./harness";

const app = resolve(__dirname, "..", "..");
const BASELINES = join(app, "test", "visual", "baseline");
const OUTPUT = join(app, "test", "visual", "output");
const UPDATE = process.env.CIRA_UPDATE_BASELINES === "1";
const VIEWPORTS = [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1280, height: 720 }] as const;
const q = (v: string, extra = "") => `tick=3${v === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(CMP)}` : ""}${extra}`;
const path = (v: string, extra = "") => `/exp/${EXP.baseline}/${v}?${q(v, extra)}`;

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });

interface Box { x: number; y: number; w: number; h: number }
const zones = (p: Page) => p.evaluate(() => Object.fromEntries(["A", "B", "C", "D", "E"].map((z) => {
  const el = document.querySelector(`[data-zone="${z}"]`);
  if (!el || (el as HTMLElement).hidden) return [z, null];
  const r = el.getBoundingClientRect();
  return [z, { x: r.x, y: r.y, w: r.width, h: r.height }];
})) as Record<string, Box | null>);

describe("[TX28][AK-GUI-15] geometry in the browser", () => {
  const cases: [string, number, number, string][] = [];
  for (const v of VIEW_IDS) for (const vp of VIEWPORTS) for (const mode of ["standard", "presentation"]) cases.push([v, vp.width, vp.height, mode]);
  // one geometry check for EN (unchanged cases) and DE (G3-21: 11 views × 3 viewports × 2 modes)
  const geometry = async (view: string, width: number, height: number, mode: string, lang: "en" | "de") => {
    const p = await open(env, path(view, `${mode === "presentation" ? "&mode=presentation" : ""}${lang === "de" ? "&lang=de" : ""}`), { width, height });
    const z = await zones(p);
    expect(z.A).toMatchObject({ x: 0, y: 0, w: width, h: ZONE.a_height });
    expect(z.D).toMatchObject({ x: 0, y: height - ZONE.d_height, w: width, h: ZONE.d_height });
    expect(z.B!.x).toBe(0);
    expect([ZONE.b_width, ZONE.b_collapsed]).toContain(z.B!.w);
    expect(z.C!.x).toBe(z.B!.w);
    expect(z.C!.y).toBe(ZONE.a_height);
    expect(z.C!.h).toBe(height - ZONE.a_height - ZONE.d_height);
    expect(z.C!.w).toBeGreaterThanOrEqual(ZONE.c_min_width);
    for (const k of ["A", "B", "C", "D"] as const) for (const v of [z[k]!.x, z[k]!.y, z[k]!.w, z[k]!.h]) expect(v % 4, `zone ${k} on 4-px grid`).toBe(0);
    const issues = await p.evaluate(() => {
      const out: string[] = [];
      const c = document.querySelector('[data-zone="C"]')!;
      // clipped text: an element that hides overflow must not need more room than it has
      for (const el of document.querySelectorAll<HTMLElement>("body *")) {
        const cs = getComputedStyle(el);
        if (!el.textContent?.trim() || cs.display === "none" || cs.visibility === "hidden") continue;
        const hides = ["hidden", "clip"].includes(cs.overflowX) || cs.textOverflow === "ellipsis";
        if (hides && el.scrollWidth > el.clientWidth + 1 && !el.closest("[data-zone=C]")?.isSameNode(el)) out.push(`clipped: ${el.className || el.tagName} ${el.scrollWidth}>${el.clientWidth}`);
      }
      // overlapping signs inside the workspace (excluding nesting and SVG children of one node)
      const signs = [...c.querySelectorAll<HTMLElement>("[data-sem]")].filter((e) => e.getClientRects().length > 0 && !e.closest("svg"));
      const rects = signs.map((e) => e.getBoundingClientRect());
      for (let i = 0; i < signs.length; i += 1) for (let j = i + 1; j < signs.length; j += 1) {
        if (signs[i]!.contains(signs[j]!) || signs[j]!.contains(signs[i]!)) continue;
        const a = rects[i]!; const b = rects[j]!;
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left); const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ix > 1 && iy > 1) out.push(`overlap: ${signs[i]!.dataset.sem} / ${signs[j]!.dataset.sem}`);
      }
      // chrome zones contain their content (A and D vertically, B horizontally)
      for (const z of ["A", "B", "D"]) {
        const zr = document.querySelector(`[data-zone="${z}"]`)!.getBoundingClientRect();
        for (const el of document.querySelectorAll<HTMLElement>(`[data-zone="${z}"] *`)) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || getComputedStyle(el).position === "fixed") continue;
          const out_ = z === "B" ? r.left < zr.left - 0.5 || r.right > zr.right + 0.5 : r.top < zr.top - 0.5 || r.bottom > zr.bottom + 0.5;
          if (out_ && !el.closest("select")) { out.push(`outside zone ${z}: ${el.tagName}.${el.className}`); break; }
        }
      }
      // legibility: rendered text never below the smallest type token (HTML) / 9 px (scaled SVG text)
      const resolve = (v: string) => { const d = document.createElement("span"); d.style.fontSize = `var(${v})`; document.body.appendChild(d);
        const px = parseFloat(getComputedStyle(d).fontSize); d.remove(); return px; };
      const minPx = Math.min(resolve("--type-micro-size"), resolve("--type-mono-id-size"));
      if (!(minPx > 0)) out.push(`type tokens did not resolve: ${minPx}`);
      for (const el of document.querySelectorAll<HTMLElement>("body *:not(svg *)")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) || el.getClientRects().length === 0) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < minPx - 0.01) { out.push(`text below ${minPx}px: ${el.tagName}.${el.className}`); break; }
      }
      for (const tx of document.querySelectorAll<SVGTextElement>("svg text")) {
        const svg = tx.ownerSVGElement!;
        const vb = svg.viewBox.baseVal;
        const scale = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1;
        if (parseFloat(getComputedStyle(tx).fontSize) * scale < 9) { out.push(`svg text below 9px: ${tx.textContent}`); break; }
      }
      // topology: every label and value stays inside its node box
      for (const n of document.querySelectorAll<SVGGElement>("svg [data-node]")) {
        const box = n.querySelector("rect")!.getBoundingClientRect();
        for (const tx of n.querySelectorAll("text")) {
          const r = tx.getBoundingClientRect();
          if (r.right > box.right + 0.5 || r.left < box.left - 0.5) { out.push(`text leaves node ${n.dataset.node}: ${tx.textContent}`); break; }
        }
      }
      // server data keeps its case and spacing
      for (const el of document.querySelectorAll<HTMLElement>("[data-datum]")) {
        if (getComputedStyle(el).textTransform !== "none") { out.push(`data transformed: ${el.dataset.datum}`); break; }
      }
      // nothing of zone C content may escape to the left of zone C or above it
      const zc = c.getBoundingClientRect();
      // visible rectangle = own box clipped by every clipping ancestor up to zone C (overflow ≠ visible, outer <svg> viewport)
      const visible = (el: Element) => {
        let r = el.getBoundingClientRect();
        let [l, t, rr, b] = [r.left, r.top, r.right, r.bottom];
        for (let a = el.parentElement; a && a !== c; a = a.parentElement) {
          const cs = getComputedStyle(a);
          const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible" || (a.tagName.toLowerCase() === "svg" && !(a.parentElement?.closest("svg")));
          if (!clips) continue;
          r = a.getBoundingClientRect();
          [l, t, rr, b] = [Math.max(l, r.left), Math.max(t, r.top), Math.min(rr, r.right), Math.min(b, r.bottom)];
        }
        return { l, t, w: rr - l, h: b - t };
      };
      for (const el of c.querySelectorAll<Element>("*")) {
        const v = visible(el);
        if (v.w > 0 && v.h > 0 && (v.l < zc.left - 1 || v.t < zc.top - 1)) {
          out.push(`escapes zone C: ${el.tagName}.${typeof el.className === "string" ? el.className : el.getAttribute("class")}`); break;
        }
      }
      return out;
    });
    expect(issues).toEqual([]);
    expect(env.misses).toEqual([]);
    expect(env.blocked, "offline: no request beyond app and local API (AK-GUI-20)").toEqual([]);
    expect(consoleErrors(p)).toEqual([]);
    if (lang === "de") expect(await p.evaluate(() => document.documentElement.lang), "German catalog active").toBe("de");
    await p.context().close();
  };
  it.each(cases)("[TX28] %s %ix%i %s: zones, no clipped text, no overlapping signs, 4-px grid", async (view, width, height, mode) => geometry(view, width, height, mode, "en"), 60000);
  it.each(cases)("[TX28] DE %s %ix%i %s: zones, no clipped text, no overlapping signs, 4-px grid", async (view, width, height, mode) => geometry(view, width, height, mode, "de"), 60000);

  it("[TX28] drawer E docks at ≥ 1600 px and overlays below; it sits above the workspace", async () => {
    for (const [width, docked] of [[1920, true], [1440, false]] as const) {
      const p = await open(env, path("TEMPORAL_STATE_EXPLORER"), { width, height: 900 });
      await p.click('[data-term="prov.drawer"]');
      // geometry of the docked/overlaid drawer is its settled state: wait for its entry motion (MOT08, IC-21)
      await p.evaluate(() => Promise.all(document.querySelector(".zone-e")!.getAnimations().map((a) => a.finished)));
      const z = await zones(p);
      expect(z.E).not.toBeNull();
      expect(z.E!.w).toBe(ZONE.e_width);
      expect(z.E!.x + z.E!.w).toBe(width);
      if (docked) expect(z.C!.x + z.C!.w).toBe(z.E!.x);
      else expect(z.C!.x + z.C!.w).toBeGreaterThan(z.E!.x);
      const top = await p.evaluate(([x, y]) => document.elementFromPoint(x!, y!)?.closest("[data-zone]")?.getAttribute("data-zone"), [z.E!.x + 20, z.E!.y + 20]);
      expect(top).toBe("E");
      await p.context().close();
    }
  }, 60000);

  it.each(VIEWPORTS.map((v) => [v.width, v.height]))("[TX28] %ix%i control panel and dialog open fully inside the viewport, above the workspace", async (width, height) => {
    const p = await open(env, path("TEMPORAL_STATE_EXPLORER"), { width, height });
    await p.click('[data-term="action.control"]');
    await p.click('[data-term="action.new"]');
    await p.waitForSelector(".dialog select option", { state: "attached" });
    const r = await p.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[data-panel="control"]')!.getBoundingClientRect();
      const out: string[] = [];
      if (panel.top < 0 || panel.left < 0 || panel.right > innerWidth + 0.5 || panel.bottom > innerHeight + 0.5) out.push(`panel outside viewport ${JSON.stringify(panel)}`);
      for (const b of document.querySelectorAll<HTMLElement>('[data-panel="control"] button')) {
        const x = b.getBoundingClientRect();
        const top = document.elementFromPoint(x.left + x.width / 2, Math.min(x.top + x.height / 2, innerHeight - 1));
        if (x.bottom > panel.top && x.top < panel.bottom && top && !b.contains(top) && !top.closest('[data-panel="control"]')) out.push(`covered: ${b.dataset.term}`);
      }
      return out;
    });
    expect(r).toEqual([]);
    await p.context().close();
  }, 60000);

  it("[TX28] reduced motion: no element keeps a transition or animation", async () => {
    const p = await open(env, path("TEMPORAL_STATE_EXPLORER"), { width: 1440, height: 900 }, "reduce");
    await p.keyboard.press("ArrowRight");
    const moving = await p.evaluate(() => [...document.querySelectorAll("*")].filter((e) => {
      const cs = getComputedStyle(e);
      return cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0) || cs.animationDuration.split(",").some((d) => parseFloat(d) > 0);
    }).length);
    expect(moving).toBe(0);
    await p.context().close();
  }, 60000);
});

describe("[TX29][AK-GUI-16] visual regression against approved baselines", () => {
  // extended set (V2T14, G3-13): 1440×900 EN (file `<view>.png`) + 1920×1080 presentation EN + 1280×720 DE
  const SETS = [["1440×900", { width: 1440, height: 900 }, "", ""], ["1920×1080 presentation", { width: 1920, height: 1080 }, "&mode=presentation", "__1920x1080__presentation"],
    ["1280×720 DE", { width: 1280, height: 720 }, "&lang=de", "__1280x720__de"]] as const;
  const cases29 = SETS.flatMap(([label, vp, extra, suffix]) => VIEW_IDS.map((v) => [v, label, vp, extra, suffix] as const));
  it.each(cases29)("[TX29] %s %s", async (view, _label, vp, extra, suffix) => {
    const p = await open(env, path(view, extra), vp);
    await p.mouse.move(0, 0);
    const shot = PNG.sync.read(await p.screenshot({ fullPage: false, animations: "disabled", caret: "hide" }));
    await p.context().close();
    const file = join(BASELINES, `${view}${suffix}.png`);
    mkdirSync(BASELINES, { recursive: true });
    if (UPDATE) {
      writeFileSync(file, PNG.sync.write(shot));
      throw new Error(`baseline written: ${file} — review it, then run without CIRA_UPDATE_BASELINES (an update run is never green)`);
    }
    expect(existsSync(file), `approved baseline missing: ${file} (run with CIRA_UPDATE_BASELINES=1 once, then review)`).toBe(true);
    const base = PNG.sync.read(readFileSync(file));
    expect([shot.width, shot.height]).toEqual([base.width, base.height]);
    const diff = new PNG({ width: base.width, height: base.height });
    const n = pixelmatch(base.data, shot.data, diff.data, base.width, base.height, { threshold: 0.1 });
    if (n > 0) { mkdirSync(OUTPUT, { recursive: true }); writeFileSync(join(OUTPUT, `${view}${suffix}.diff.png`), PNG.sync.write(diff)); writeFileSync(join(OUTPUT, `${view}${suffix}.png`), PNG.sync.write(shot)); }
    expect(n / (base.width * base.height), "differing pixel share (tolerance 0.1 %)").toBeLessThanOrEqual(0.001);
  }, 60000);
});

describe("[TX32][AK-GUI-19] accessibility", () => {
  const axe = readFileSync(join(app, "node_modules/axe-core/axe.min.js"), "utf-8");
  it.each(VIEW_IDS.map((v) => [v]))("[TX32] %s: axe-core without serious or critical findings", async (view) => {
    const p = await open(env, path(view), { width: 1440, height: 900 });
    await p.addScriptTag({ content: axe });
    const res = await p.evaluate(async () => {
      const r = await (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: { id: string; impact: string; nodes: { target: string[] }[] }[] }> } })
        .axe.run(document, { resultTypes: ["violations"] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, at: v.nodes.slice(0, 2).map((x) => x.target.join(" ")) }));
    });
    expect(res.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    await p.context().close();
  }, 60000);

  it("[TX32] control panel and new-experiment dialog: axe-core without serious or critical findings", async () => {
    const p = await open(env, path("TEMPORAL_STATE_EXPLORER"), { width: 1440, height: 900 });
    await p.click('[data-term="action.control"]');
    await p.click('[data-term="action.new"]');
    await p.waitForSelector(".dialog select option", { state: "attached" });
    await p.addScriptTag({ content: axe });
    const res = await p.evaluate(async () => {
      const r = await (window as unknown as { axe: { run: (c: Element, o: unknown) => Promise<{ violations: { id: string; impact: string }[] }> } })
        .axe.run(document.querySelector('[data-panel="control"]')!, { resultTypes: ["violations"] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact }));
    });
    expect(res.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    await p.context().close();
  }, 60000);

  it.each(["TEMPORAL_STATE_EXPLORER", "STRUCTURAL_METRICS", "SCENARIO_COMPARISON"].map((v) => [v]))(
    "[TX32] %s: every control reachable by keyboard with a visible focus indicator", async (view) => {
      const p = await open(env, path(view), { width: 1920, height: 1080 });
      const focusable = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex='-1'])")]
        .filter((e) => e.getClientRects().length > 0).length);
      const seen = new Set<string>();
      for (let i = 0; i < focusable + 2; i += 1) {
        await p.keyboard.press("Tab");
        const f = await p.evaluate(() => {
          const e = document.activeElement as HTMLElement | null;
          if (!e || e === document.body) return null;
          const cs = getComputedStyle(e);
          const visible = (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none") || cs.boxShadow !== "none";
          const path: string[] = [];
          for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) path.unshift(`${n.tagName}:${[...(n.parentElement?.children ?? [])].indexOf(n)}`);
          return { id: path.join("/"), visible };
        });
        if (!f) continue;
        expect(f.visible, `focus visible on ${f.id}`).toBe(true);
        seen.add(f.id);
      }
      expect(seen.size).toBe(focusable);
      await p.context().close();
    }, 90000);
});
