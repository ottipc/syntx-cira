// F07.2 Projection Access — typed client. Only the local API is contacted (INV-FUN-08).
export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`HTTP ${status}`);
  }
}

export function apiBase(): string {
  const meta = typeof document !== "undefined" ? document.querySelector('meta[name="cira-api"]')?.getAttribute("content") : null;
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_CIRA_API;
  return (meta && meta.length > 0 ? meta : env && env.length > 0 ? env : "http://127.0.0.1:8000").replace(/\/$/, "");
}

export type Query = Readonly<Record<string, string | number | null | undefined>>;

export function buildPath(path: string, query: Query = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined) q.set(k, String(v));
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export async function getJson<T>(pathWithQuery: string, signal?: AbortSignal): Promise<T> {
  const r = await fetch(apiBase() + pathWithQuery, { signal, headers: { Accept: "application/json" } });
  const body: unknown = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, body);
  return body as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<{ status: number; body: T }> {
  const r = await fetch(apiBase() + path, { method: "POST", headers: { "Content-Type": "application/json" },
                                             body: JSON.stringify(body ?? {}) });
  const data: unknown = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, data);
  return { status: r.status, body: data as T };
}
