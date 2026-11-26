import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-028: VIEW_DATA_UNAVAILABLE — no stale data, reload offered. */
export function Quarantine({ requested, received, onReload }: { requested: string; received: string; onReload: () => void }) {
  const t = useT();
  return (
    <div className="quarantine" role="alert" {...semAttrs("SEM-028", "msg.unavailable")}>
      <p><span aria-hidden="true">⚠ </span>{t("msg.unavailable")}</p>
      <p className="mono-id">{t("msg.requested")} {requested}</p>
      <p className="mono-id">{t("msg.received")} {received}</p>
      <button type="button" className="btn" onClick={onReload} data-term="action.reload">{t("action.reload")}</button>
    </div>
  );
}
