// TX22 (semiontic SSOT complete, no channel collision) and TX23 (WCAG contrast, CIEDE2000 distance) — computed here
// independently of tools/gen_semiontics.py from the YAML SSOT and the bundled contract schema.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { SEM } from "../../src/semiontics/generated/sem";
import { TERMS } from "../../src/language";

type J = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const root = join(__dirname, "..", "..");
const reg: J = parse(readFileSync(join(root, "semiontics/cira.semiontics.yaml"), "utf-8"));
const terms: J = parse(readFileSync(join(root, "semiontics/cira.terms.yaml"), "utf-8"));
const schema: J = JSON.parse(readFileSync(join(root, "../contracts/schemas/cira.contracts.schema.json"), "utf-8"));
const enums: Record<string, string[]> = Object.fromEntries(Object.entries(schema.$defs as Record<string, J>)
  .filter(([, d]) => Array.isArray(d.enum)).map(([k, d]) => [k, d.enum as string[]]));

describe("[TX22] semiontic SSOT completeness", () => {
  const classes = [...reg.signified_enums, ...reg.labelled_enums, ...reg.internal_enums] as string[];
  it("[TX22] every contract enum is classified exactly once (signified | labelled | internal)", () => {
    for (const e of Object.keys(enums)) expect(classes.filter((c) => c === e).length, e).toBe(1);
    for (const c of classes) expect(Object.keys(enums), `classified but not in schema: ${c}`).toContain(c);
  });
  it("[TX22] every displayable value of a signified enum maps to exactly one SEM", () => {
    for (const e of reg.signified_enums as string[]) {
      for (const v of enums[e] ?? []) {
        if ((reg.unsigned_values[e] ?? []).includes(v)) continue;
        const hits = (reg.sems as J[]).filter((s) => (s.binds ?? []).some((b: J) => b.enum === e && (b.values ?? []).includes(v)));
        expect(hits.map((s) => s.id), `${e}.${v}`).toHaveLength(1);
      }
    }
  });
  it("[TX22] every value of signified and labelled enums has exactly one TERM, present in EN and DE", () => {
    for (const e of [...reg.signified_enums, ...reg.labelled_enums] as string[]) {
      const map = terms.enum_terms[e];
      expect(map, `enum_terms.${e}`).toBeDefined();
      for (const v of enums[e] ?? []) {
        const key = map[v];
        expect(key, `${e}.${v}`).toBeTypeOf("string");
        const entry = (TERMS as Record<string, { en: string; de: string }>)[key];
        expect(entry, `${e}.${v} → ${key}`).toBeDefined();
        expect(entry!.en.length * entry!.de.length).toBeGreaterThan(0);
      }
    }
  });
  it("[TX22] no channel collision: signs that share a view differ in shape, colour, glyph or pattern", () => {
    const sems = reg.sems as J[];
    for (let v = 1; v <= 11; v += 1) {
      const inView = sems.filter((s) => s.views.includes(v));
      const sig = inView.map((s) => JSON.stringify([s.channels.shape, s.channels.color, s.channels.glyph, s.channels.pattern]));
      const dup = sig.filter((x, i) => sig.indexOf(x) !== i);
      expect(dup, `view ${v}`).toEqual([]);
    }
  });
  it("[TX22] each SEM names a catalog TERM and the generated register matches the SSOT", () => {
    for (const s of reg.sems as J[]) {
      expect(Object.keys(TERMS), `${s.id} term ${s.term}`).toContain(s.term);
      expect((SEM as Record<string, { glyph: string | null; name: string }>)[s.id]?.name).toBe(s.name);
      expect((SEM as Record<string, { glyph: string | null }>)[s.id]?.glyph ?? null).toBe(s.channels.glyph ?? null);
    }
  });
  it("[TX22][AK-GUI-04] openness signs {006, 007, 008, 009, 012, 031} pairwise distinct and never in violation colour", () => {
    const open = (reg.sems as J[]).filter((s) => ["SEM-006", "SEM-007", "SEM-008", "SEM-009", "SEM-012", "SEM-031"].includes(s.id));
    expect(open).toHaveLength(6);
    const sig = open.map((s) => JSON.stringify([s.channels.shape, s.channels.glyph, s.channels.pattern]));
    expect(new Set(sig).size).toBe(6);
    for (const s of open) expect(s.channels.color, s.id).not.toBe("eval.violation");
  });
});

// --- independent colour science -------------------------------------------------------------------------------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h: string) => { const [r, g, b] = hex(h).map(lin) as [number, number, number]; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]; return (x + 0.05) / (y + 0.05); };
function lab(h: string): [number, number, number] {
  const [r, g, b] = hex(h).map(lin) as [number, number, number];
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const de2000 = (a: string, b: string): number => deLab(lab(a), lab(b));
function deLab([L1, a1, b1]: [number, number, number], [L2, a2, b2]: [number, number, number]): number {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1); const C2 = Math.hypot(a2, b2); const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1; const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1); const Cp2 = Math.hypot(ap2, b2);
  const hp = (x: number, y: number) => (x === 0 && y === 0 ? 0 : (Math.atan2(y, x) / rad + 360) % 360);
  const h1 = hp(ap1, b1); const h2 = hp(ap2, b2);
  const dL = L2 - L1; const dC = Cp2 - Cp1;
  let dh = h2 - h1; if (Cp1 * Cp2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh / 2) * rad);
  const Lb = (L1 + L2) / 2; const Cpb = (Cp1 + Cp2) / 2;
  let hb = h1 + h2; if (Cp1 * Cp2 !== 0) hb = Math.abs(h1 - h2) > 180 ? (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  const dT = 30 * Math.exp(-(((hb - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cpb ** 7 / (Cpb ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2); const Sc = 1 + 0.045 * Cpb; const Sh = 1 + 0.015 * Cpb * T;
  const Rt = -Math.sin(2 * dT * rad) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
}

describe("[TX23][AK-GUI-14] colour rules on the token set", () => {
  const col = reg.tokens.color as Record<string, string>;
  const cr = reg.tokens.contrast_rules;
  it("[TX23] implementation check against published reference data (Sharma, Wu, Dalal 2005; WCAG 2.x)", () => {
    const pairs: [[number, number, number], [number, number, number], number][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 0, 0], [50, -1, 2], 2.3669],
      [[50, 2.5, 0], [73, 25, -18], 27.1492],
      [[50, 2.5, 0], [61, -5, 29], 22.8977],
      [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    ];
    for (const [x, y, want] of pairs) expect(deLab(x, y)).toBeCloseTo(want, 4);
    expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 6);
    expect(contrast("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });
  it("[TX23] text tokens ≥ 4.5 : 1 on every text surface", () => {
    for (const s of cr.text_surfaces) for (const t of cr.text_tokens) expect(contrast(col[t]!, col[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(cr.text_min);
    for (const s of ["surface.field", "surface.panel"]) for (const t of cr.text_tokens_field_panel) expect(contrast(col[t]!, col[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(cr.text_min);
  });
  it("[TX23] text on tinted space cells ≥ 4.5 : 1", () => {
    for (const s of cr.tints) for (const t of cr.tint_text) expect(contrast(col[t]!, col[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(cr.text_min);
  });
  it("[TX23] semantic graphics ≥ 3 : 1 on every surface", () => {
    for (const s of cr.text_surfaces) for (const t of cr.semantic) expect(contrast(col[t]!, col[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(cr.graphic_min);
  });
  it("[TX23] co-occurring semantic colours ΔE00 ≥ 15", () => {
    const sem = cr.semantic as string[];
    for (let i = 0; i < sem.length; i += 1) for (let j = i + 1; j < sem.length; j += 1) {
      expect(de2000(col[sem[i]!]!, col[sem[j]!]!), `${sem[i]} / ${sem[j]}`).toBeGreaterThanOrEqual(cr.semantic_pairs_delta_e_min);
    }
  });
  it("[TX23] the generated colour report agrees with this independent computation", () => {
    const rep: J = JSON.parse(readFileSync(join(root, "../docs/gui/color-report.json"), "utf-8"));
    for (const [t, s, v] of rep.text as [string, string, number][]) {
      const surf = s.replace(" (graphic)", "");
      expect(Math.abs(contrast(col[t]!, col[surf]!) - v), `${t}/${s}`).toBeLessThan(0.01);
    }
    for (const p of rep.pairs as [string, string, number][]) expect(Math.abs(de2000(col[p[0]]!, col[p[1]]!) - p[2]), `${p[0]}/${p[1]}`).toBeLessThan(0.1);
  });
});
