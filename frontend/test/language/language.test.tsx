// TX24 — product language (AK-GUI-13): catalog EN and DE complete; runtime text of all eleven views in both
// languages contains no blocked internal term, no raw term key, no unfilled placeholder, no Ω without its label.
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { FORBIDDEN_VISIBLE, TERMS } from "../../src/language";
import { VIEW_IDS } from "../../src/session";
import { renderAt, workspace } from "../helpers/render";
import { CMP, EXP } from "../helpers/snapshots";

type Entry = { en: string; de: string; params?: string[] };
const T = TERMS as unknown as Record<string, Entry>;
const root = join(__dirname, "..", "..");
const DATA = "[data-datum], .mono-id, .mono-value, .mono-operator, .raw, details.technical";

/** Visible product text: everything except data (ids, values, engine data, raw record). */
function productText(el: Element): string {
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll(DATA).forEach((x) => x.remove());
  c.querySelectorAll("[hidden], [aria-hidden='true']").forEach((x) => x.remove());
  return c.textContent ?? "";
}

describe("[TX24][AK-GUI-13] catalog", () => {
  it("[TX24] every term has non-empty EN and DE text and the same placeholders in both", () => {
    const src: { terms: Entry[] & { key: string }[] } = parse(readFileSync(join(root, "semiontics/cira.terms.yaml"), "utf-8"));
    expect(Object.keys(T).length).toBe(src.terms.length);
    for (const [k, e] of Object.entries(T)) {
      expect(e.en.trim().length, `${k}.en`).toBeGreaterThan(0);
      expect(e.de.trim().length, `${k}.de`).toBeGreaterThan(0);
      const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(ph(e.de), k).toEqual(ph(e.en));
    }
  });
  it("[TX24] no catalog text contains a blocked internal term", () => {
    for (const [k, e] of Object.entries(T)) for (const f of FORBIDDEN_VISIBLE) {
      if (k === "product.name") continue;
      expect(`${e.en} | ${e.de}`.includes(f), `${k} contains ${f}`).toBe(false);
    }
  });
  it("[TX24] no raw product text in source (AST lint over src/)", () => {
    const out = execFileSync("node", [join(root, "scripts/lint-arch.mjs"), "--json"], { cwd: root }).toString();
    expect((JSON.parse(out) as string[]).filter((f) => f.includes(" TX24 "))).toEqual([]);
  });
  it("[TX24] the lint detects raw text (fixture)", () => {
    let out = "[]";
    try { execFileSync("node", [join(root, "scripts/lint-arch.mjs"), "--root", join(root, "test/fixtures/lint"), "--json"], { cwd: root }); }
    catch (e) { out = String((e as { stdout: Buffer }).stdout); }
    const f = JSON.parse(out) as string[];
    expect(f.filter((x) => x.includes(" TX24 ")).length).toBe(2);
  });
});

describe("[TX24][AK-GUI-13] runtime text scan, EN and DE", () => {
  const keys = new Set(Object.keys(T));
  const cases: [string, string, "baseline" | "blocked"][] = [];
  for (const lang of ["en", "de"]) for (const v of VIEW_IDS) for (const exp of ["baseline", "blocked"] as const) cases.push([lang, v, exp]);
  it.each(cases)("[TX24] %s %s (%s)", async (lang, view, exp) => {
    const q = `tick=3&lang=${lang}${view === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(CMP)}` : ""}`;
    const r = await renderAt(`/exp/${EXP[exp]}/${view}?${q}`);
    const text = productText(r.root);
    for (const f of FORBIDDEN_VISIBLE) expect(text.includes(f), `blocked term "${f}"`).toBe(false);
    expect(text.match(/\{\w+\}/g), "unfilled placeholder").toBeNull();
    const words = text.match(/\b[a-z][a-z_0-9]*(?:\.[a-z_0-9]+)+\b/g) ?? [];
    expect(words.filter((w) => keys.has(w)), "raw term keys").toEqual([]);
    for (const el of r.root.querySelectorAll("*")) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? "").join("");
      if (!own.includes("Ω") || el.closest(DATA)) continue;
      const labelled = ["a", "o", "r"].some((s) => (el.textContent ?? "").includes(T[`space.${s}.short`]![lang as "en" | "de"]) || own.includes(T[`space.${s}`]![lang as "en" | "de"]));
      expect(labelled, `Ω without label: "${own}"`).toBe(true);
    }
    const title = workspace(r.root).querySelector(".view-title")?.textContent;
    expect(title).toBe(T[`view.${String(VIEW_IDS.indexOf(view as (typeof VIEW_IDS)[number]) + 1).padStart(2, "0")}`]![lang as "en" | "de"]);
  });
});
