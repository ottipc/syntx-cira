// U02 runner self-test: the inspection matrix covers 11 views × 3 viewports × 2 languages × 2 modes (08.5).
import { describe, expect, it } from "vitest";
import { VIEW_IDS } from "../../src/session";
import { MATRIX } from "./matrix";

describe("[U02] inspection matrix", () => {
  it("has 132 unique settled states, every view in every viewport, language and mode", () => {
    expect(MATRIX).toHaveLength(132);
    expect(new Set(MATRIX.map((c) => c.name)).size).toBe(132);
    for (const v of VIEW_IDS) expect(MATRIX.filter((c) => c.view === v)).toHaveLength(12);
  });
});
