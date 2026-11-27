// V3T04 (architecture v2.0.3, 04.3/03.5): styles read role variables, never raw ink/surface-block tokens, so a focus
// scope can remap them; the exempt set is marked in the DOM by the primitives themselves.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EXEMPT } from "../../src/semiontics/primitives/_util";

const css = readFileSync(join(__dirname, "..", "..", "src", "app.css"), "utf-8");
const ROLE_TOKENS = /var\(--col-(ink-(primary|secondary|muted)|surface-panel|border-hairline|space-(actual|observed|reconstructed)-tint)\)/g;

describe("[V3T04] role variables", () => {
  it("raw ink / block-surface / tint tokens appear only inside the role definition", () => {
    const outside = css.replace(/:root, \[data-attn="exempt"\] \{[^}]*\}/, "");
    expect(outside.match(ROLE_TOKENS) ?? []).toEqual([]);
  });
  it("the exempt set covers origin, barrier, gate, violated rule, seam, quarantine and every absence sign", () => {
    for (const s of ["SEM-006", "SEM-007", "SEM-008", "SEM-009", "SEM-011", "SEM-012", "SEM-013", "SEM-017", "SEM-019", "SEM-020",
      "SEM-022", "SEM-024", "SEM-028", "SEM-031", "SEM-035"]) expect(EXEMPT.has(s as never), s).toBe(true);
  });
});
