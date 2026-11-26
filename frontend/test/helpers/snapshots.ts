// Snapshot server for DOM tests (TX15): the app sees only real backend answers recorded by gen_snapshots.py.
// Exact route match with order-insensitive query comparison; every miss is recorded and fails the test.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "snapshots");
interface Index { routes: Record<string, { file: string; status: number }>; experiments: Record<string, string>; comparison: string }
export const INDEX: Index = JSON.parse(readFileSync(join(dir, "index.json"), "utf-8"));
export const EXP = INDEX.experiments as { baseline: string; recovery: string; blocked: string; sparse: string };
export const CMP = INDEX.comparison;

export const canon = (pathWithQuery: string): string => {
  const u = new URL(pathWithQuery, "http://snapshot.local");
  const q = [...u.searchParams.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return q.length ? `${u.pathname}?${new URLSearchParams(q).toString()}` : u.pathname;
};
const ROUTES = new Map(Object.entries(INDEX.routes).map(([k, v]) => [canon(k), v] as const));

export function snapshot<T = unknown>(url: string): T {
  const r = ROUTES.get(canon(url));
  if (!r) throw new Error(`no snapshot for ${url}`);
  return JSON.parse(readFileSync(join(dir, r.file), "utf-8")) as T;
}
export const hasSnapshot = (url: string): boolean => ROUTES.has(canon(url));

export interface Server { requests: string[]; misses: string[]; posts: string[]; override: Map<string, (body: unknown) => unknown>;
  /** canonical URL → promise the response waits for (to observe LOADING) */
  hold: Map<string, Promise<void>> }

/** Install as global fetch. `override` maps a canonical URL to a body transformer (guard tests). */
export function snapshotFetch(server: Server): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const u = new URL(raw);
    const key = canon(u.pathname + u.search);
    if ((init?.method ?? "GET") !== "GET") {
      server.posts.push(key);
      return new Response(JSON.stringify({ code: "TEST_NO_POST" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    server.requests.push(key);
    const h = server.hold.get(key);
    if (h) await h;
    const r = ROUTES.get(key);
    if (!r) {
      server.misses.push(key);
      return new Response(JSON.stringify({ code: "NOT_FOUND" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    let body: unknown = JSON.parse(readFileSync(join(dir, r.file), "utf-8"));
    const o = server.override.get(key);
    if (o) body = o(body);
    return new Response(JSON.stringify(body), { status: r.status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}
