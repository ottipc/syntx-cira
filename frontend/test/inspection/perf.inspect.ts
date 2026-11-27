// Relative performance sample (08.7, V2T15/V2T23): frame intervals and long tasks while the environment is active.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import { EXP } from "../helpers/snapshots";
import { type Env, open, start, stop } from "../browser/harness";

const out = join(resolve(__dirname, "..", ".."), "test-results", "inspection", "perf");
const SECONDS = Number(process.env.CIRA_PERF_SECONDS ?? 10);
let env: Env;
beforeAll(async () => { env = await start(); mkdirSync(out, { recursive: true }); });
afterAll(async () => { await stop(env); });

describe("performance sample", () => {
  it("samples frame intervals and long tasks on view 01 (presentation)", async () => {
    const p = await open(env, `/exp/${EXP.baseline}/SYSTEM_FIELD_OVERVIEW?tick=3&mode=presentation`, { width: 1920, height: 1080 });
    const r = await p.evaluate((s) => new Promise<{ frames: number[]; longTasks: number }>((res) => {
      const frames: number[] = []; let last = performance.now(); let long = 0;
      try { new PerformanceObserver((l) => { long += l.getEntries().filter((e) => e.duration > 50).length; }).observe({ entryTypes: ["longtask"] }); } catch { /* not supported */ }
      const end = last + s * 1000;
      const tick = (t: number) => { frames.push(t - last); last = t; if (t < end) requestAnimationFrame(tick); else res({ frames, longTasks: long }); };
      requestAnimationFrame(tick);
    }), SECONDS);
    const sorted = [...r.frames].sort((a, b) => a - b);
    const pct = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
    writeFileSync(join(out, `perf-${Date.now()}.json`), JSON.stringify({ seconds: SECONDS, frames: r.frames.length, median_ms: pct(0.5), p95_ms: pct(0.95), long_tasks: r.longTasks,
      note: "headless Chrome without GPU: relative comparison branch vs main only; absolute budgets on reference hardware (DEP-V3-05)" }, null, 1));
    await p.context().close();
  });
});
