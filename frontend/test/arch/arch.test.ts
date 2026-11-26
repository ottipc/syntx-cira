// TX02 (TS drift), TX25 (G03.3 import boundaries), TX26 (computation ban), TX30 (glyph coverage), TX33 (layout).
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as fontkit from "fontkit";
import { SEM } from "../../src/semiontics/generated/sem";
import { GRAPH } from "../../src/semiontics/generated/tokens";
import { layout } from "../../src/views/02-topology/layout";
import { EXP, snapshot } from "../helpers/snapshots";

type J = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const root = join(__dirname, "..", "..");
const run = (args: string[]): { code: number; out: string } => {
  try { return { code: 0, out: execFileSync("node", args, { cwd: root }).toString() }; }
  catch (e) { const x = e as { status: number; stdout: Buffer }; return { code: x.status, out: String(x.stdout) }; }
};

describe("[TX02][AK-GUI-12][REQ-062] TS contract drift", () => {
  it("[TX02] generated TS contracts equal the bundled schema", () => {
    expect(run(["scripts/gen-contracts.mjs", "--check"])).toEqual({ code: 0, out: "ts-contracts: in sync\n" });
  });
});

describe("[TX25] internal F07 boundaries (dependency-cruiser generated from G03.3)", () => {
  it("[TX25] rules are in sync with the G03.3 table", () => {
    expect(run(["scripts/gen-depcruise.mjs", "--check"]).code).toBe(0);
  });
  it("[TX25] src has no forbidden import", () => {
    const r = run([join(root, "node_modules/dependency-cruiser/bin/dependency-cruiser.mjs"), "src", "--config", ".dependency-cruiser.cjs",
      "--output-type", "json"]);
    const res: J = JSON.parse(r.out);
    expect(res.summary.violations).toEqual([]);
    expect(res.summary.error).toBe(0);
    expect(res.summary.totalCruised).toBeGreaterThan(100);
  });
  it("[TX25] every G03.3 sub-field has a rule set (10 sub-fields)", () => {
    const cfg = require(join(root, ".dependency-cruiser.cjs")) as { forbidden: { name: string }[] }; // eslint-disable-line
    const sub = cfg.forbidden.filter((r) => r.name.startsWith("g03-3-") && !r.name.includes("contracts")).map((r) => r.name);
    expect(sub.length).toBeGreaterThanOrEqual(8);
  });
});

describe("[TX26][AK-GUI-11] computation ban in views", () => {
  it("[TX26] AST lint: no arithmetic, domain comparison, cross-space value comparison or counting in src/views", () => {
    const r = run(["scripts/lint-arch.mjs", "--json"]);
    expect(JSON.parse(r.out)).toEqual([]);
    expect(r.code).toBe(0);
  });
  it("[TX26] the lint detects every forbidden form in the fixture", () => {
    const f = JSON.parse(run(["scripts/lint-arch.mjs", "--root", "test/fixtures/lint", "--json"]).out) as string[];
    const tx26 = f.filter((x) => x.includes(" TX26 "));
    for (const m of ["arithmetic '*'", "domain comparison '>'", "Math.*", "value comparison between spaces", "counting via filter().length"]) {
      expect(tx26.some((x) => x.includes(m)), m).toBe(true);
    }
    expect(tx26.some((x) => x.includes("model.ts:2")), "sort comparator in a ViewModel is allowed").toBe(false);
    expect(tx26.some((x) => x.includes("model.ts:3")), "arithmetic in a ViewModel is not").toBe(true);
    expect(f.filter((x) => x.includes(" CANON ")).length).toBe(2);
    expect(f.filter((x) => x.includes(" CSS-TOKEN ")).length).toBe(2);
  });
});

describe("[TX30][AK-GUI-17][AK-GUI-07] bundled monospace covers every canonical and sign character", () => {
  const font = fontkit.openSync(join(root, "node_modules/@fontsource/dejavu-mono/files/dejavu-mono-latin-400-normal.woff2")) as J;
  const CANON = [">", "<", "≈", "→", "↔", "⊕", "⊖", "⊗", "⊘", "∆", "∇", "∑", "∂", "Σ"];
  const ARROWS = ["▸", "▾", "◀", "▶"];
  const signGlyphs = Object.values(SEM as Record<string, { glyph: string | null }>).flatMap((s) => (s.glyph ? [...s.glyph] : []));
  const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
  const srcChars = walk(join(root, "src")).filter((p) => /\.(tsx|ts)$/.test(p) && !p.includes("/generated/"))
    .flatMap((p) => [...readFileSync(p, "utf-8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "")])
    .filter((c) => c.codePointAt(0)! > 0x7f && !/\p{L}/u.test(c) && !/\s/u.test(c) && c !== "“" && c !== "”");
  const chars = [...new Set([...CANON, ...ARROWS, ...signGlyphs, ...srcChars, "0", "9", "/", "="])].sort();

  it("[TX30] font is the pinned DejaVu Sans Mono from @fontsource", () => {
    expect(font.familyName).toBe("DejaVu Sans Mono");
    const pkg: J = JSON.parse(readFileSync(join(root, "node_modules/@fontsource/dejavu-mono/package.json"), "utf-8"));
    expect(pkg.version).toBe("5.3.0");
  });
  it.each(chars.map((c) => [c, `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`]))("[TX30] %s (%s) has a glyph", (c) => {
    expect(font.hasGlyphForCodePoint(c.codePointAt(0)!)).toBe(true);
  });
  it("[TX30] one advance width for all checked characters (no double-width glyph)", () => {
    const w = new Set(chars.map((c) => font.glyphForCodePoint(c.codePointAt(0)!).advanceWidth));
    expect([...w]).toEqual([font.glyphForCodePoint(48).advanceWidth]);
  });
  it("[TX30] every glyph box stays within ascent and descent (uniform line height)", () => {
    for (const c of chars) {
      const b = font.glyphForCodePoint(c.codePointAt(0)!).bbox;
      expect(b.maxY, c).toBeLessThanOrEqual(font.ascent);
      expect(b.minY, c).toBeGreaterThanOrEqual(font.descent);
    }
  });
  it("[TX30] the stylesheet maps the mono token to this family", () => {
    expect(readFileSync(join(root, "src/semiontics/generated/tokens.css"), "utf-8")).toContain("--font-mono: 'DejaVu Mono'");
    expect(readFileSync(join(root, "node_modules/@fontsource/dejavu-mono/400.css"), "utf-8")).toContain("font-family: 'DejaVu Mono'");
  });
});

describe("[TX33][AK-GUI-08] deterministic graph layout", () => {
  const shuffle = <T,>(xs: readonly T[], seed: number): T[] => {
    const a = [...xs];
    let s = seed;
    for (let i = a.length - 1; i > 0; i -= 1) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
    return a;
  };
  it.each(Object.entries(EXP))("[TX33] %s: same input → byte-identical coordinates; input order irrelevant", (_k, e) => {
    const tp = snapshot<J>(`/experiments/${e}/topology`).topology;
    const ref = JSON.stringify(layout(tp, GRAPH));
    expect(JSON.stringify(layout(tp, GRAPH))).toBe(ref);
    for (const seed of [1, 7, 42]) {
      expect(JSON.stringify(layout({ ...tp, nodes: shuffle(tp.nodes, seed), relations: shuffle(tp.relations, seed + 1) }, GRAPH))).toBe(ref);
    }
  });
  it("[TX33] nodes never overlap; every relation becomes one path; geometry derives from graph tokens only", () => {
    const tp = snapshot<J>(`/experiments/${EXP.baseline}/topology`).topology;
    const l = layout(tp, GRAPH);
    expect(l.nodes).toHaveLength(tp.nodes.length);
    expect(l.edges).toHaveLength(tp.relations.length);
    for (let i = 0; i < l.nodes.length; i += 1) for (let j = i + 1; j < l.nodes.length; j += 1) {
      const a = l.nodes[i]!; const b = l.nodes[j]!;
      const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      expect(apart, `${a.id} / ${b.id}`).toBe(true);
    }
    for (const n of l.nodes) expect(n.h).toBe(GRAPH.node_height);
    const wide = layout(tp, { ...GRAPH, node_min_width: 400 });
    expect(wide.nodes.every((n) => n.w >= 400)).toBe(true);
  });
});
