import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-035: δ = 1 as delivered by the server (K-63) — never computed on the client. */
export function DeviationSeam() {
  const t = useT();
  return <span className="seam" {...semAttrs("SEM-035", "dev.mismatch")} title={t("dev.mismatch")}><span aria-hidden="true">┆</span><span className="seam-text">{t("dev.mismatch")}</span></span>;
}
