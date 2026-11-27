// V3T01 (architecture v2.0.3, 05.1/05.11/05.15): derived tokens, transition path minima, decor budgets and the projector
// profile — recomputed here independently of tools/gen_semiontics.py from the YAML SSOT, then compared to the output.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

type J = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const root = join(__dirname, "..", "..");
const reg: J = parse(readFileSync(join(root, "semiontics/cira.semiontics.yaml"), "utf-8"));
const tok = reg.tokens;
const css = readFileSync(join(root, "src/semiontics/generated/tokens.css"), "utf-8");
const report: J = JSON.parse(readFileSync(join(root, "../docs/gui/color-report.json"), "utf-8"));

const ch = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// 8-bit rounding: half to even, as declared for derived tokens (generator and this test agree by definition)
const rhe = (v: number) => { const f = Math.floor(v), d = v - f; return d > 0.5 + 1e-9 ? f + 1 : d < 0.5 - 1e-9 ? f : f % 2 === 0 ? f : f + 1; };
const hx = (c: number[]) => "#" + c.map((v) => rhe(v).toString(16).padStart(2, "0").toUpperCase()).join("");
const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (h: string) => { const [r, g, b] = ch(h).map(lin) as [number, number, number]; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]; return (x + 0.05) / (y + 0.05); };
const mix = (a: string, b: string, t: number) => { const A = ch(a), B = ch(b); return hx(A.map((v, i) => v * t + B[i]! * (1 - t))); };

const col: Record<string, string> = { ...tok.color };
for (const [k, d] of Object.entries(tok.derive as Record<string, J>)) {
  if (d.op === "mix") col[k] = mix(col[d.a]!, col[d.b]!, d.t);
  if (d.op === "lightest_on_path") {
    let best = col[d.from]!;
    for (let i = 0; i <= 1000; i++) { const c = mix(col[d.to]!, col[d.from]!, i / 1000); if (Object.entries(d.keep as Record<string, number>).every(([f, m]) => contrast(col[f]!, c) >= m)) best = c; }
    col[k] = best;
  }
}
const textMin = tok.contrast_rules.text_min as number;
const allText = [...tok.contrast_rules.text_tokens, ...tok.contrast_rules.text_tokens_field_panel] as string[];

describe("[V3T01] derived tokens (05.1 T1)", () => {
  it("resolve to the frozen architecture values", () => {
    expect(col["surface.focus"]).toBe("#141D27");
    expect([col["attn.tint.actual"], col["attn.tint.observed"], col["attn.tint.reconstructed"]]).toEqual(["#0B1922", "#1A160E", "#151424"]);
    expect(col["attn.border.hairline"]).toBe("#131C24");
  });
  it("are emitted by the generator exactly as computed here", () => {
    for (const k of Object.keys(tok.derive)) expect(css, k).toContain(`--col-${k.replace(/\./g, "-")}: ${col[k]};`);
  });
  it("every text token ≥ 4.5 : 1 on the focus surface and on attenuated grounds", () => {
    for (const t of allText) expect(contrast(col[t]!, col["surface.focus"]!), `${t} on focus`).toBeGreaterThanOrEqual(textMin);
    for (const s of ["attn.tint.actual", "attn.tint.observed", "attn.tint.reconstructed"]) for (const t of ["ink.secondary", "ink.muted"])
      expect(contrast(col[t]!, col[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(textMin);
  });
});

describe("[V3T01] transition path minima (05.11)", () => {
  it("every declared animated pair stays ≥ 4.5 : 1 on the whole path (linear sRGB, 200 samples)", () => {
    for (const [name, [f0, f1, b0, b1]] of Object.entries(tok.transitions as Record<string, string[]>)) {
      let m = 99;
      for (let i = 0; i <= 200; i++) m = Math.min(m, contrast(mix(col[f1!]!, col[f0!]!, i / 200), mix(col[b1!]!, col[b0!]!, i / 200)));
      expect(m, name).toBeGreaterThanOrEqual(textMin);
      expect(Math.abs((report.transitions as J)[name] - m), `${name}: report`).toBeLessThan(0.01);
    }
  });
});

describe("[V3T01] decor budgets and graphics (04.7, 04.2)", () => {
  const d = tok.decor, r = tok.decor_rules, brand = col["brand.core"]!, ground = col[r.ground]!;
  it("text allowed on decor ground keeps ≥ 4.5 : 1 under the text budget and under an axis alone", () => {
    for (const t of r.text_on_decor as string[]) {
      expect(contrast(col[t]!, mix(brand, ground, d["alpha.text"])), `${t} @ text budget`).toBeGreaterThanOrEqual(textMin);
      expect(contrast(col[t]!, mix(brand, ground, d["axis.alpha"])), `${t} @ axis`).toBeGreaterThanOrEqual(textMin);
    }
  });
  it("the excluded token really would fail on decor ground (the exclusion is necessary, G3-31)", () => {
    for (const t of r.excluded_from_decor_ground as string[]) expect(contrast(col[t]!, mix(brand, ground, d["alpha.text"]))).toBeLessThan(textMin);
  });
  it("focus and resonance inks ≥ 3 : 1 on every surface including focus and elevated", () => {
    for (const g of r.graphic_inks as string[]) for (const s of ["surface.void", "surface.field", "surface.panel", "surface.focus", "surface.elevated"])
      expect(contrast(col[g]!, col[s]!), `${g} on ${s}`).toBeGreaterThanOrEqual(tok.contrast_rules.graphic_min);
  });
});

describe("[V3T01] Enhanced Projector Contrast profile (05.15)", () => {
  const p = { ...col, ...tok.profile_projector } as Record<string, string>;
  it("every text token ≥ 4.5 : 1 on the projector surfaces", () => {
    for (const s of ["surface.void", "surface.field", "surface.panel"]) for (const t of allText)
      expect(contrast(p[t]!, p[s]!), `${t} on ${s}`).toBeGreaterThanOrEqual(textMin);
  });
  it("the panel edge #546D86 ≥ 3 : 1 against every adjacent surface (OD-12)", () => {
    expect(p["border.strong"]).toBe("#546D86");
    for (const s of ["surface.void", "surface.field", "surface.panel", "surface.focus", "surface.elevated"])
      expect(contrast(p["border.strong"]!, p[s]!), s).toBeGreaterThanOrEqual(tok.decor_rules.projector_edge_min);
  });
  it("is emitted under html[data-profile='projector'] only", () => {
    expect(css).toMatch(/html\[data-profile='projector'\] \{[^}]*--col-border-strong: #546D86;/);
  });
});
