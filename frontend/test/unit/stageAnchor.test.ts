// V3T11 (unit part), V3T19 (fit rule): the stage function reproduces the measured geometry of 05.17 and 09.11.
import { describe, expect, it } from "vitest";
import { compositionFit, presentationScale, stageAnchor, stageClass } from "../../src/shell/stageAnchor";

describe("[V3T11] stage anchor (05.17)", () => {
  it.each([
    [1700, 980, 1428, 490, 218, [1210, 1428, 1646]],
    [1380, 800, 1159, 400, 177, [982, 1159, 1336]],
    [1220, 800, 1025, 400, 156, [869, 1025, 1181]],
    [1060, 700, 891, 350, 136, [755, 891, 1027]],
  ] as const)("W0 %i × H %i → (%i, %i, R %i)", (W0, H, cx, cy, R, axes) => {
    const a = stageAnchor(W0, H);
    expect([a.cx, a.cy, a.R]).toEqual([cx, cy, R]);
    expect(a.axes).toEqual(axes);
  });
  it("is pure: same stage, same anchor; the shadow falls away from the light, toward the information space", () => {
    expect(stageAnchor(1700, 980)).toEqual(stageAnchor(1700, 980));
    expect(stageAnchor(1700, 980).shadow).toEqual({ dx: -8, dy: 4 });
  });
});

describe("[V3T19] composition fit, stage class and presentation scale (05.9, 05.17)", () => {
  it("fit matches the measured matrix", () => {
    expect(compositionFit(stageAnchor(1700, 980), 1.25)).toBe("reserve");
    expect(compositionFit(stageAnchor(1700, 980), 1)).toBe("reserve");
    expect(compositionFit(stageAnchor(1380, 800), 1.042)).toBe("reserve");
    expect(compositionFit(stageAnchor(1220, 800), 1.042)).toBe("collapsed");
    expect(compositionFit(stageAnchor(1220, 800), 1)).toBe("collapsed");
    expect(compositionFit(stageAnchor(1060, 700), 1)).toBe("collapsed");
  });
  it("stage class: short below 880 px Zone C height", () => {
    expect(stageClass(980)).toBe("tall");
    expect(stageClass(800)).toBe("short");
  });
  it("presentation scale law: 1.25 at 1080, 1.042 at 900, floor 1.0", () => {
    expect([presentationScale(1080), presentationScale(900), presentationScale(800)]).toEqual([1.25, 1.042, 1]);
  });
});
