import type { ReactNode } from "react";
import type { Verified } from "../../access";
import { useT } from "../../language";
import { Quarantine } from "../../semiontics";

/** Block-level view state (06.7, G03.14): LOADING masks, VIEW_DATA_UNAVAILABLE quarantines without old data. */
export function Guarded<T>({ v, children, skeleton }: { v: Verified<T>; children: (d: T) => ReactNode; skeleton?: ReactNode }) {
  const t = useT();
  if (v.status === "LOADING") return <div className="loading-mask" aria-busy="true" data-state="LOADING">{skeleton ?? <span className="muted">{t("msg.loading")}</span>}</div>;
  if (v.status === "VIEW_DATA_UNAVAILABLE" || v.data === null) {
    return <Quarantine requested={v.guard && !v.guard.ok ? `${v.guard.reason} ${v.guard.requested}` : v.spec.url}
      received={v.guard && !v.guard.ok ? v.guard.received : "—"} onReload={v.refetch} />;
  }
  return <div data-state="READY">{children(v.data)}</div>;
}

type Data<V> = { [K in keyof V]: V[K] extends Verified<infer T> ? T : never };

/** One block drawn from several projections (G03.14): masked while any is LOADING, quarantined if any fails its
 *  guard, rendered only when all are verified — never partial data with placeholder signs. */
export function GuardedAll<V extends readonly Verified<unknown>[]>({ vs, children }: { vs: V; children: (d: Data<V>) => ReactNode }) {
  const failed = vs.find((v) => v.status === "VIEW_DATA_UNAVAILABLE" || (v.status === "READY" && v.data === null));
  if (failed) return <Guarded v={failed}>{() => null}</Guarded>;
  const loading = vs.find((v) => v.status === "LOADING");
  if (loading) return <Guarded v={loading}>{() => null}</Guarded>;
  return <div data-state="READY">{children(vs.map((v) => v.data) as unknown as Data<V>)}</div>;
}
