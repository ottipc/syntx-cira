// Browser harness (TX28/TX29/TX32): fresh production build served statically; the page reaches only this server
// and the API origin, which is answered from projection snapshots. Every other request is aborted (AK-GUI-20).
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright-core";
import { canon, INDEX } from "../helpers/snapshots";

const app = resolve(__dirname, "..", "..");
const dist = join(app, "test-results", "browser-dist");
const snaps = join(app, "test", "snapshots");
const API = "http://127.0.0.1:8000";
const ROUTES = new Map(Object.entries(INDEX.routes).map(([k, v]) => [canon(k), v] as const));
const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2",
  ".woff": "font/woff", ".svg": "image/svg+xml", ".json": "application/json" };
export const CHROME = process.env.CIRA_CHROME ?? "/usr/bin/google-chrome";

export interface Env { browser: Browser; base: string; server: Server; misses: string[]; blocked: string[]; posts: string[] }

export async function start(): Promise<Env> {
  execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir", "--logLevel", "error"], { cwd: app, stdio: "pipe" });
  const server = createServer((req, res) => {
    const p = decodeURIComponent((req.url ?? "/").split("?")[0]!);
    let f = join(dist, p);
    if (!f.startsWith(dist) || !existsSync(f) || statSync(f).isDirectory()) f = join(dist, "index.html");
    res.writeHead(200, { "Content-Type": TYPES[extname(f)] ?? "application/octet-stream" });
    createReadStream(f).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--font-render-hinting=none", "--disable-lcd-text"] });
  return { browser, base, server, misses: [], blocked: [], posts: [] };
}

export async function stop(e: Env): Promise<void> {
  await e.browser.close();
  await new Promise<void>((r) => e.server.close(() => r()));
}

export async function open(e: Env, path: string, viewport = { width: 1440, height: 900 }, reducedMotion: "reduce" | "no-preference" = "no-preference",
  opts: { delayMs?: number; settle?: boolean } = {}): Promise<Page> {
  const ctx = await e.browser.newContext({ viewport, reducedMotion, deviceScaleFactor: 1, locale: "en-US", timezoneId: "UTC" });
  const page = await ctx.newPage();
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const u = new URL(route.request().url());
    if (u.origin === API) requests.push(`${route.request().method()} ${u.pathname}${u.search}`);
    if (u.origin === e.base) return route.continue();
    if (u.origin === API) {
      if (route.request().method() !== "GET") { e.posts.push(u.pathname); return route.fulfill({ status: 405, body: "{}" }); }
      const r = ROUTES.get(canon(u.pathname + u.search));
      if (!r) { e.misses.push(u.pathname + u.search); return route.fulfill({ status: 404, contentType: "application/json", body: "{}" }); }
      if (opts.delayMs) await new Promise((res) => setTimeout(res, opts.delayMs));
      return route.fulfill({ status: r.status, contentType: "application/json", body: readFileSync(join(snaps, r.file), "utf-8") });
    }
    e.blocked.push(u.href);
    return route.abort();
  });
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (err) => errors.push(String(err)));
  (page as Page & { cira?: { errors: string[]; requests: string[] } }).cira = { errors, requests };
  if (opts.settle === false) { await page.goto(e.base + path, { waitUntil: "commit" }); return page; }
  await page.goto(e.base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForFunction(() => document.querySelector('[data-state="LOADING"]') === null && document.querySelector('[data-zone="C"]') !== null);
  return page;
}
export const consoleErrors = (p: Page): string[] => (p as Page & { cira?: { errors: string[] } }).cira?.errors ?? [];
/** API requests the page made (method, path and query), in order — for the request inventory (V3T03). */
export const apiRequests = (p: Page): string[] => (p as Page & { cira?: { requests: string[] } }).cira?.requests ?? [];
