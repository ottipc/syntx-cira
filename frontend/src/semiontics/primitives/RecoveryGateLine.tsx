import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-020: proposal → human authorization → recovery variant. Never a closed automatic loop. */
export function RecoveryGateLine() {
  const t = useT();
  return (
    <div className="recovery-line" {...semAttrs("SEM-020", "loop.recovery")}>
      <span className="mono-id">{t("proposal")}</span><span aria-hidden="true"> ═◇═ </span>
      <span className="mono-id">{t("authority")}</span><span aria-hidden="true"> ═▸ </span>
      <span className="mono-id">{t("scenario.recovery")}</span>
      <span className="reason"> · {t("loop.recovery")}</span>
    </div>
  );
}
