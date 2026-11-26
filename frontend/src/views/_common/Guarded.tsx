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
