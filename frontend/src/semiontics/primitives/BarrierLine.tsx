import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-019: Ω_A ↛ engine. No pass-through, no hover connection. */
export function BarrierLine() {
  const t = useT();
  return (
    <div className="barrier" {...semAttrs("SEM-019", "barrier")} role="note">
      <span aria-hidden="true">║ ‖ </span><span className="barrier-text">{t("barrier")}</span><span aria-hidden="true"> ║</span>
    </div>
  );
}
