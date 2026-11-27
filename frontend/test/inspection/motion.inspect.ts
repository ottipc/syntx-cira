// Motion contact sheets (architecture v2.0.3, 08.4): CDP screencast frames for 400 ms after each trigger, per motion
// class, normal and reduced motion. Evidence files for visual inspection, never baselines.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "../browser/harness";

const run = process.env.CIRA_INSPECT_RUN ?? new Date().toISOString().replace(/[:.]/g, "-");
const out = join(resolve(__dirname, "..", ".."), "test-results", "inspection", run, "motion");
let env: Env;
beforeAll(async () => { env = await start(); });
afterAll(async () => { await stop(env); });
const url = (v: string) => `/exp/${EXP.baseline}/${v}?tick=3`;

const CASES: [string, string, string][] = [
  ["MOT03-view-entry", "TOPOLOGY_GRAPH", `document.querySelector('.zone-b a[href*="/TEMPORAL_STATE_EXPLORER"]').click()`],
  ["MOT04-MOT11-focus-lock", "TEMPORAL_STATE_EXPLORER", `document.querySelector('[data-attribute="attr:n08/state"] .focus-handle').click()`],
  ["MOT04-svg-node", "TOPOLOGY_GRAPH", `document.querySelector('[data-node="node:n08"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`],
  ["MOT05-tick-commit", "TEMPORAL_STATE_EXPLORER", `[...document.querySelectorAll('[data-zone="D"] button')].find((b) => b.textContent.trim().startsWith("t4")).click()`],
  ["MOT08-drawer", "STRUCTURAL_METRICS", `document.querySelector('.zone-c-content button[data-term="prov.drawer"]').click()`],
];

describe("motion contact sheets", () => {
  it("captures every class for 400 ms (normal and reduced)", async () => {
    for (const reduced of [false, true]) {
      for (const [name, view, trigger] of CASES) {
        const p = await open(env, url(view), { width: 1440, height: 900 }, reduced ? "reduce" : "no-preference");
        await p.waitForTimeout(400);
        const cdp = await p.context().newCDPSession(p);
        const frames: Buffer[] = [];
        cdp.on("Page.screencastFrame", (f: { data: string; sessionId: number }) => { frames.push(Buffer.from(f.data, "base64")); void cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); });
        await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
        await p.waitForTimeout(60);
        await p.evaluate(trigger);
        await p.waitForTimeout(400);
        await cdp.send("Page.stopScreencast");
        const dir = join(out, `${name}${reduced ? "__reduced" : ""}`);
        mkdirSync(dir, { recursive: true });
        frames.forEach((b, i) => writeFileSync(join(dir, `${String(i).padStart(2, "0")}.png`), b));
        await p.context().close();
      }
    }
  }, 300000);
});
