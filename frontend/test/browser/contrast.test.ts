// @vitest-environment node
// V2T25 (architecture v2.0.3, 04.2, 07.1): computed-colour contrast audit in the browser. Every visible text node
// (≥ 4.5 : 1) and every graphic part of a `data-sem` sign (border, outline, SVG stroke/fill; ≥ 3.0 : 1) against its
// effective opaque ground — in rest, and with a focus locked (focused, resonant, attenuated items present), in standard
// and in projector profile, plus sampled frames while the focus transition runs.
import type { Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resonanceCases } from "../helpers/resonanceCases";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "./harness";

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });

interface Finding { kind: "text" | "graphic"; ratio: number; what: string }

/** Runs in the page: lowest ratios per element class. */
const auditScript = () => {
  const parse = (c: string): number[] | null => {
    let m = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(c);
    if (m) return [+m[1]! / 255, +m[2]! / 255, +m[3]! / 255, m[4] === undefined ? 1 : +m[4]];
    m = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)$/.exec(c);
    return m ? [+m[1]!, +m[2]!, +m[3]!, m[4] === undefined ? 1 : +m[4]] : null;
  };
  const lum = (v: number[]) => { const f = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * f(v[0]!) + 0.7152 * f(v[1]!) + 0.0722 * f(v[2]!); };
  const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]; return (x + 0.05) / (y + 0.05); };
  // effective ground: composite translucent backgrounds over the first opaque one (alpha blending in sRGB, like the browser)
  const groundOf = (e: Element | null): number[] => {
    const layers: number[][] = [];
    for (let x = e; x; x = x.parentElement) {
      const cs = getComputedStyle(x);
      const c = parse(x instanceof SVGElement && x.tagName !== "svg" ? "rgba(0, 0, 0, 0)" : cs.backgroundColor);
      if (c && c[3]! > 0) { layers.push(c); if (c[3]! >= 1) break; }
    }
    let g = layers.length && layers[layers.length - 1]![3]! >= 1 ? layers.pop()! : parse(getComputedStyle(document.body).backgroundColor)!;
    while (layers.length) { const c = layers.pop()!; g = [0, 1, 2].map((i) => c[i]! * c[3]! + g[i]! * (1 - c[3]!)).concat(1); }
    return g;
  };
  const svgGround = (e: Element): number[] => {
    // SVG text/graphics sit on the node box fill if inside a node, else on the SVG's own ground
    const box = e.closest("[data-node]")?.querySelector(".node-box");
    const f = box ? parse(getComputedStyle(box).fill) : null;
    return f && f[3]! >= 1 ? f : groundOf(e.closest("svg"));
  };
  const visible = (e: Element) => { const cs = getComputedStyle(e); return cs.visibility !== "hidden" && cs.display !== "none" && e.getClientRects().length > 0
    && !e.closest('[aria-hidden="true"].ambient, .ambient, .sr-only'); };
  const out: { kind: "text" | "graphic"; ratio: number; what: string }[] = [];
  const name = (e: Element) => `${e.tagName.toLowerCase()}.${(e.getAttribute("class") ?? "").split(" ")[0]}${e.getAttribute("data-sem") ? `[${e.getAttribute("data-sem")}]` : ""}`;
  for (const e of document.querySelectorAll("body *")) {
    if (!visible(e)) continue;
    const cs = getComputedStyle(e);
    const op = parseFloat(cs.opacity);
    if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) {
      const svg = e instanceof SVGElement;
      const c = parse(svg ? cs.fill : cs.color);
      if (c && c[3]! > 0) out.push({ kind: "text", ratio: ratio(c, svg ? svgGround(e) : groundOf(e)) * (op < 1 ? 0 : 1), what: name(e) });
    }
    if (!e.hasAttribute("data-sem")) continue;
    const g = e instanceof SVGElement ? svgGround(e) : groundOf(e.parentElement);
    const parts: string[] = [];
    if (e instanceof SVGElement) { if (cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0) parts.push(cs.stroke); }
    else for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
      if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== "none") parts.push(cs[`border${side}Color`]);
    }
    for (const p of parts) { const c = parse(p); if (c && c[3]! >= 1) out.push({ kind: "graphic", ratio: ratio(c, g), what: name(e) }); }
  }
  return out;
};

const worst = (xs: Finding[], kind: Finding["kind"], limit: number) => {
  const m = new Map<string, number>();
  for (const x of xs) if (x.kind === kind && x.ratio < limit) m.set(x.what, Math.min(m.get(x.what) ?? 99, x.ratio));
  return [...m].sort((a, b) => a[1] - b[1]).slice(0, 12).map(([w, r]) => `${w} ${r.toFixed(2)}`);
};

describe("[V2T25] computed-colour contrast audit", () => {
  const cases = resonanceCases().map((c) => ({ ...c, focus: c.ids.find((f) => c.resolve(f).some((x) => c.ids.includes(x))) ?? c.ids[0]! }));
  for (const profile of ["standard", "projector"] as const) {
    it.each(cases.map((c) => [c.view, c] as const))(`${profile} · view %s: rest, focused/resonant/attenuated, transition frames`, async (_v, c) => {
      const q = `/exp/${EXP.baseline}/${c.key}?${c.query}${profile === "projector" ? "&mode=presentation&contrast=projector" : ""}`;
      const all: Finding[] = [];
      const rest = await open(env, q, { width: 1920, height: 1080 });
      await rest.waitForSelector(`[data-focus-id="${c.focus}"]`, { state: "attached" });
      await rest.waitForTimeout(300);
      all.push(...await rest.evaluate(auditScript));
      // transition frames: lock the focus by click and audit three frames while MOT04/11 run, then the settled state
      const clicked = await rest.evaluate((f) => { const el = document.querySelector(`[data-focus-id="${f}"]`);
        const h = el?.querySelector(".focus-handle") ?? el; if (!h) return false; h.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }, c.focus);
      if (clicked) for (let i = 0; i < 3; i++) { await rest.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null)))); all.push(...await rest.evaluate(auditScript)); }
      await rest.waitForTimeout(300);
      const states = await rest.evaluate(() => [...new Set([...document.querySelectorAll("[data-focus-state]")].map((e) => e.getAttribute("data-focus-state")))].sort());
      all.push(...await rest.evaluate(auditScript));
      await rest.context().close();
      expect(states, "focused and attenuated present (resonant where the data relates)").toEqual(expect.arrayContaining(["attenuated", "focused"]));
      expect(all.filter((x) => x.kind === "text").length).toBeGreaterThan(20);
      expect(worst(all, "text", 4.5), "text ≥ 4.5 : 1").toEqual([]);
      expect(worst(all, "graphic", 3.0), "sign graphics ≥ 3.0 : 1").toEqual([]);
    }, 120000);
  }
});

export type { Page };
