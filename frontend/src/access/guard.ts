// Header guard (G03.14, K-58, INV-FUN-01): every projection is checked against the session by its guard class.
import type { GuardClass, ProjectionHeader } from "../contracts/generated/cira";

export type EchoKey = "attempt" | "revision" | "direction" | "aggregation" | "to_tick" | "from" | "to" | "comparison_id";
export interface Expectation {
  guard: GuardClass;
  experimentId: string | null;
  tick: number | null;
  echo: Partial<Record<EchoKey, string | number | null>>;
}
export type GuardResult = { ok: true } | { ok: false; reason: string; requested: string; received: string };

const ECHO_KEYS: readonly EchoKey[] = ["attempt", "revision", "direction", "aggregation", "to_tick", "from", "to",
  "comparison_id"];

export function checkHeader(h: ProjectionHeader | undefined | null, e: Expectation): GuardResult {
  if (!h) return { ok: false, reason: "missing header", requested: e.guard, received: "none" };
  if (h.guard_class !== e.guard) return { ok: false, reason: "guard class", requested: e.guard, received: h.guard_class };
  const fail = (reason: string, a: unknown, b: unknown): GuardResult =>
    ({ ok: false, reason, requested: String(a), received: String(b) });
  if (e.guard !== "GLOBAL" && e.guard !== "COMPARISON" && h.experiment_id !== e.experimentId) {
    return fail("experiment", e.experimentId, h.experiment_id);
  }
  if (e.guard === "TIMED" && h.tick !== e.tick) return fail("tick", e.tick, h.tick);
  if ((e.guard === "TIMELESS" || e.guard === "COMPARISON" || e.guard === "RANGE") && h.tick !== null && h.tick !== undefined) {
    return fail("tick", null, h.tick);
  }
  const echo: Partial<Record<string, unknown>> = { ...h.query_echo };
  for (const k of ECHO_KEYS) {
    if (!(k in e.echo)) continue;
    const want = e.echo[k] ?? null;
    const got = echo[k] ?? null;
    if (want !== got) return fail(k, want, got);
  }
  return { ok: true };
}
