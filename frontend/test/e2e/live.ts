// Live harness (TX20, TX31): a real uvicorn backend on a free port with an empty store, the production build served on
// 127.0.0.1:4173 (an allowed CORS origin of the API) with the API URL injected through <meta name="cira-api">.
import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { createServer as createHttp, type Server } from "node:http";
import { createServer as createNet } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright-core";

const app = resolve(__dirname, "..", "..");
const backend = resolve(app, "..", "backend");
const dist = join(app, "test-results", "e2e-dist");
const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2",
  ".woff": "font/woff", ".svg": "image/svg+xml" };
export const STATIC_PORT = 4173;

export interface Live { api: string; base: string; proc: ChildProcess; server: Server; browser: Browser; log: string[] }

const freePort = () => new Promise<number>((r) => { const s = createNet(); s.listen(0, "127.0.0.1", () => { const p = (s.address() as { port: number }).port; s.close(() => r(p)); }); });

async function waitFor(url: string, ms: number): Promise<void> {
  const until = Date.now() + ms;
  for (;;) {
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    if (Date.now() > until) throw new Error(`backend did not answer ${url}`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

export async function startLive(): Promise<Live> {
  const port = await freePort();
  const api = `http://127.0.0.1:${port}`;
  const log: string[] = [];
  const proc = spawn(process.env.CIRA_PYTHON ?? "python3", ["-m", "uvicorn", "--factory", "app.api.main:create_app", "--host", "127.0.0.1",
    "--port", String(port), "--log-level", "warning"], { cwd: backend, env: { ...process.env, CIRA_DATA: mkdtempSync(join(tmpdir(), "cira-e2e-")) } });
  proc.stdout?.on("data", (d) => log.push(String(d)));
  proc.stderr?.on("data", (d) => log.push(String(d)));
  await waitFor(`${api}/health`, 30000);
  execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir", "--logLevel", "error"], { cwd: app, stdio: "pipe" });
  const index = readFileSync(join(dist, "index.html"), "utf-8").replace('<meta name="cira-api" content="" />', `<meta name="cira-api" content="${api}" />`);
  if (!index.includes(api)) throw new Error("cira-api meta tag not found in build");
  const server = createHttp((req, res) => {
    const p = decodeURIComponent((req.url ?? "/").split("?")[0]!);
    const f = join(dist, p);
    if (f.startsWith(dist) && existsSync(f) && !statSync(f).isDirectory() && !f.endsWith("index.html")) {
      res.writeHead(200, { "Content-Type": TYPES[extname(f)] ?? "application/octet-stream" });
      createReadStream(f).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(index);
  });
  await new Promise<void>((r, j) => { server.once("error", j); server.listen(STATIC_PORT, "127.0.0.1", r); });
  const browser = await chromium.launch({ executablePath: process.env.CIRA_CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  return { api, base: `http://127.0.0.1:${STATIC_PORT}`, proc, server, browser, log };
}

export async function stopLive(l: Live): Promise<void> {
  await l.browser.close();
  await new Promise<void>((r) => l.server.close(() => r()));
  l.proc.kill("SIGTERM");
}

export async function post(l: Live, path: string, body: unknown): Promise<{ status: number; body: any }> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(l.api + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
}
export async function get(l: Live, path: string): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(l.api + path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

/** Seed through the public API only (no store access): baseline, recovery, comparison; waits for completion. */
export async function seed(l: Live): Promise<{ baseline: string; recovery: string; comparison: string }> {
  const base = { scenario_id: "scn:fx_base", observation_config_id: "ocfg:fx_partial", target_definition_id: "tgt:fx" };
  const b = (await post(l, "/experiments", { ...base, label: "Baseline" })).body.experiment_id as string;
  const r = (await post(l, "/experiments", { ...base, scenario_id: "scn:fx_rec", label: "Recovery" })).body.experiment_id as string;
  for (const e of [b, r]) {
    const until = Date.now() + 60000;
    while ((await get(l, `/experiments/${e}`)).experiment.status === "RUNNING" || (await get(l, `/experiments/${e}`)).experiment.status === "CREATED") {
      if (Date.now() > until) throw new Error(`${e} did not finish`);
      await new Promise((res) => setTimeout(res, 200));
    }
  }
  const c = await post(l, "/comparisons", { baseline_experiment_id: b, recovery_experiment_id: r });
  if (c.status >= 300) throw new Error(`comparison: ${c.status}`);
  return { baseline: b, recovery: r, comparison: c.body.comparison.comparison_key as string };
}

export interface Traffic { requests: { method: string; url: string }[]; blocked: string[]; errors: string[] }

export async function page(l: Live, path: string, viewport = { width: 1440, height: 900 }): Promise<{ p: Page; traffic: Traffic }> {
  const ctx = await l.browser.newContext({ viewport, acceptDownloads: true, locale: "en-US", timezoneId: "UTC" });
  const p = await ctx.newPage();
  const traffic: Traffic = { requests: [], blocked: [], errors: [] };
  await p.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.origin === l.base || u.origin === l.api) {
      if (u.origin === l.api) traffic.requests.push({ method: route.request().method(), url: u.pathname + u.search });
      return route.continue();
    }
    traffic.blocked.push(u.href);
    return route.abort();
  });
  p.on("console", (m) => { if (m.type() === "error") traffic.errors.push(m.text()); });
  p.on("pageerror", (e) => traffic.errors.push(String(e)));
  await p.goto(l.base + path, { waitUntil: "networkidle" });
  await settled(p);
  return { p, traffic };
}

export async function settled(p: Page): Promise<void> {
  await p.waitForLoadState("networkidle");
  await p.waitForFunction(() => document.querySelector('[data-state="LOADING"]') === null && document.querySelector('[data-zone="C"]') !== null);
}
