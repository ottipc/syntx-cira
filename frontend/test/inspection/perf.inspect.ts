// Relative performance and size (architecture v2.0.3, 08.7, V2T15, V2T23): the branch and `main` (ac5073b, checked out
// by the caller at CIRA_MAIN_DIR) are built and served by the same harness, in the same container, one after the other.
// Per build: 30 s of demo playback from view 01 with the environment active — frame intervals (rAF) and long tasks —
// and the compressed size of the built assets. Relative comparison only; absolute budgets need reference hardware
// (DEP-V3-05). Evidence file, never a gate report.
import { readdirSync, readFileSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, it } from "vitest";
import { EXP } from "../helpers/snapshots";
import { open, start, stop } from "../browser/harness";

const run = process.env.CIRA_INSPECT_RUN ?? new Date().toISOString().replace(/[:.]/g, "-");
const out = join(resolve(__dirname, "..", ".."), "test-results", "inspection", run);
const SECONDS = Number(process.env.CIRA_PERF_SECONDS ?? 30);
const MAIN = process.env.CIRA_MAIN_DIR;

const files = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? files(join(d, f)) : [join(d, f)]));
const size = (dist: string) => {
  const fs = files(dist);
  const raw = fs.reduce((s, f) => s + statSync(f).size, 0);
  const gz = fs.reduce((s, f) => s + gzipSync(readFileSync(f), { level: 9 }).length, 0);
  return { files: fs.length, raw_bytes: raw, gzip_bytes: gz };
};

async function measure(label: string, appDir?: string) {
  const env = await start(appDir ? { appDir } : {});
  const p = await open(env, `/exp/${EXP.baseline}/SYSTEM_FIELD_OVERVIEW?tick=3&mode=presentation`, { width: 1920, height: 1080 });
  await p.waitForTimeout(500);
  await p.click('button[data-term="action.play_demo"]');
  const r = await p.evaluate((s) => new Promise<{ frames: number[]; longTasks: number; longTaskMs: number; ambient: string[] }>((res) => {
    const frames: number[] = []; let last = performance.now(); let long = 0, longMs = 0; const ambient = new Set<string>();
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { long++; longMs += e.duration; } }).observe({ entryTypes: ["longtask"] }); } catch { /* not supported */ }
    const end = last + s * 1000;
    const tick = (t: number) => { frames.push(t - last); last = t; ambient.add(document.querySelector<HTMLElement>(".zone-c")?.dataset.ambient ?? "none");
      if (t < end) requestAnimationFrame(tick); else res({ frames, longTasks: long, longTaskMs: Math.round(longMs), ambient: [...ambient] }); };
    requestAnimationFrame(tick);
  }), SECONDS);
  const steps = await p.evaluate(() => location.pathname.split("/").pop());
  await p.context().close();
  const s = [...r.frames].sort((a, b) => a - b);
  const pct = (q: number) => Math.round(s[Math.min(s.length - 1, Math.floor(q * s.length))]! * 10) / 10;
  const result = { label, seconds: SECONDS, frames: r.frames.length, median_ms: pct(0.5), p95_ms: pct(0.95), p99_ms: pct(0.99), long_tasks: r.longTasks,
    long_task_ms: r.longTaskMs, ambient_states: r.ambient, view_after: steps, size: size(env.dist) };
  await stop(env);
  return result;
}

describe("performance and size: branch vs main", () => {
  it("measures both builds under the same conditions", async () => {
    mkdirSync(out, { recursive: true });
    const branch = await measure("branch");
    const main = MAIN ? await measure("main ac5073b", join(MAIN, "frontend")) : null;
    writeFileSync(join(out, "perf.json"), JSON.stringify({ run, branch, main,
      size_added_gzip_bytes: main ? branch.size.gzip_bytes - main.size.gzip_bytes : null,
      note: "headless Chrome, software rendering, same container, sequential runs: relative comparison only (G3-24, DEP-V3-05)" }, null, 1) + "\n");
  }, 600000);
});
