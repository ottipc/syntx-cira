// @vitest-environment node
// V3T20 (architecture v2.0.3 F04, ADR-0009) for the coupling architecture v0.5 (A5): in demo step 6 the metric view carries the focused accuracy card (M11) with its band
// head to the top, so reconstruction coverage (M05) and accuracy (M11) are whole in view on every presentation stage,
// the band head is visible and the observation band (M06) has left the frame. Reached like Play demo: step 5 → Next.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import STEPS from "../../src/demo/demo.steps.json";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "./harness";

let env: Env;
beforeAll(async () => { env = await start(); }, 120000);
afterAll(async () => { await stop(env); });

describe("[V3T20] demo step 6 context carry keeps coverage and accuracy whole in view (ADR-0009, F04)", () => {
  it("step 6 focuses the accuracy card of the reconstruction band", () => {
    const s = STEPS.steps[5]!;
    expect(s.view).toBe("STRUCTURAL_METRICS");
    expect((s as { focus?: string }).focus).toBe("metric:m11/a_r///");
  });
  it.each([[1920, 1080], [1600, 900], [1440, 900], [1280, 800]] as const)("stage %i × %i", async (w, h) => {
    const p = await open(env, `/exp/${EXP.baseline}/FORWARD_SWEEP_INSPECTOR?tick=3&mode=presentation&demoStep=5`, { width: w, height: h });
    await p.click('[data-term="action.next"]');
    await p.waitForFunction(() => document.querySelector('[data-metric="M11"][data-focus-state="focused"]') !== null);
    await p.waitForTimeout(300);
    const g = await p.evaluate(() => {
      const r = (s: string) => { const b = document.querySelector(s)!.getBoundingClientRect(); return [b.top, b.bottom] as const; };
      return { port: r(".zone-c-content"), m05: r('[data-metric="M05"]'), m11: r('[data-metric="M11"]'), m06: r('[data-metric="M06"]'),
        head: r('[data-band="metric.band.reconstruction"] h2'),
        m05state: document.querySelector('[data-metric="M05"]')!.getAttribute("data-focus-state"),
        caption: document.querySelector(".demo-bar .narration")?.textContent ?? "" };
    });
    await p.context().close();
    const inside = ([t, b]: readonly [number, number]) => t >= g.port[0] - 0.5 && b <= g.port[1] + 0.5;
    expect(inside(g.m05), "M05 whole in view").toBe(true);
    expect(inside(g.m11), "M11 whole in view").toBe(true);
    expect(g.head[0] >= g.port[0] - 0.5, "band head in view").toBe(true);
    expect(g.m06[1] <= g.port[0] + 0.5, "M06 out of view").toBe(true);
    expect(g.m05state).toBe("resonant");
    expect(g.caption).toContain("Exact fractions, no overall score");
  }, 60000);
});
