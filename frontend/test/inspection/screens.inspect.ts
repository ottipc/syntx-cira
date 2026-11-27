// Screenshot matrix for visual inspection (08.5). Evidence files, never baselines.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import { CMP, EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "../browser/harness";
import { MATRIX } from "./matrix";

const run = process.env.CIRA_INSPECT_RUN ?? new Date().toISOString().replace(/[:.]/g, "-");
const out = join(resolve(__dirname, "..", ".."), "test-results", "inspection", run);
const only = process.env.CIRA_INSPECT_VIEWS?.split(",");
let env: Env;
beforeAll(async () => { env = await start(); mkdirSync(out, { recursive: true }); });
afterAll(async () => { await stop(env); });

describe("inspection matrix", () => {
  it("renders every settled state of the matrix", async () => {
    const index: string[] = [];
    for (const c of MATRIX.filter((x) => !only || only.includes(x.view))) {
      const q = `tick=3&lang=${c.lang}${c.mode === "presentation" ? "&mode=presentation" : ""}${c.view === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(CMP)}` : ""}`;
      const p = await open(env, `/exp/${EXP.baseline}/${c.view}?${q}`, { width: c.width, height: c.height });
      await p.mouse.move(0, 0);
      await p.screenshot({ path: join(out, `${c.name}.png`), animations: "disabled", caret: "hide" });
      index.push(c.name);
      await p.context().close();
    }
    writeFileSync(join(out, "index.json"), JSON.stringify({ run, count: index.length, cases: index }, null, 1));
  });
});
