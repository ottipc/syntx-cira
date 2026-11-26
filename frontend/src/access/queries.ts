// Verified projections (G03.8): fetch → header guard → cache. Mismatch, network or schema error ⇒ VIEW_DATA_UNAVAILABLE
// without old data ("No stale cross-tick bleed"). Cache keys contain every mirrored parameter.
import { useQuery } from "@tanstack/react-query";
import type { ProjectionHeader } from "../contracts/generated/cira";
import { getJson } from "./client";
import type { Spec } from "./endpoints";
import { checkHeader, type GuardResult } from "./guard";

export type Status = "LOADING" | "READY" | "VIEW_DATA_UNAVAILABLE";
export interface Verified<T> { status: Status; data: T | null; guard: GuardResult | null; refetch: () => void; spec: Spec }

export function useProjection<T extends { header?: ProjectionHeader }>(spec: Spec | null, poll = false): Verified<T> {
  const q = useQuery({
    queryKey: ["cira", spec?.url ?? "none"],
    queryFn: ({ signal }) => getJson<T>(spec?.url ?? "/health", signal),
    enabled: spec !== null,
    retry: false,
    refetchInterval: poll ? 1000 : false,
    staleTime: poll ? 0 : Infinity,
  });
  const nullSpec: Spec = { key: "none", url: "", expect: { guard: "GLOBAL", experimentId: null, tick: null, echo: {} } };
  const s = spec ?? nullSpec;
  if (spec === null || q.isPending) return { status: "LOADING", data: null, guard: null, refetch: () => void q.refetch(), spec: s };
  if (q.isError || !q.data) {
    return { status: "VIEW_DATA_UNAVAILABLE", data: null, refetch: () => void q.refetch(), spec: s,
             guard: { ok: false, reason: "request", requested: spec.url, received: String(q.error) } };
  }
  const g = checkHeader(q.data.header, spec.expect);
  if (!g.ok) return { status: "VIEW_DATA_UNAVAILABLE", data: null, guard: g, refetch: () => void q.refetch(), spec: s };
  return { status: "READY", data: q.data, guard: g, refetch: () => void q.refetch(), spec: s };
}

/** Unverified fetch for endpoints without header (export bundle). */
export function useRaw<T>(url: string | null) {
  return useQuery({ queryKey: ["cira-raw", url], queryFn: ({ signal }) => getJson<T>(url ?? "", signal),
    enabled: url !== null, retry: false });
}
