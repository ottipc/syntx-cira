import { useT } from "../../language";
import { IdText, RecoveryGateLine } from "../../semiontics";
import type { ComparisonResponse } from "./model";

export function ComparisonBanner({ c }: { c: ComparisonResponse["comparison"] }) {
  const t = useT();
  return (
    <div className="panel stack" data-compatible={String(c.compatible)}>
      <div className="row"><span>{t("ui.baseline")}</span><IdText>{c.baseline_experiment_id}</IdText><span>{t("ui.vs")}</span>
        <span>{t("ui.recovery")}</span><IdText>{c.recovery_experiment_id}</IdText>
        <span className="secondary">{t("cmp.tau")} =</span><span className="mono-value">{String(c.comparison_tick)}</span></div>
      <div className="row secondary"><span>{t("cmp.lineage")}</span><IdText>{c.fixture_lineage_id}</IdText><span>· {t("cmp.basis")}</span></div>
      <div className="row"><span>{t(c.compatible ? "cmp.compatible" : "cmp.incompatible")}</span>
        {c.incompatibility.map((x) => <IdText key={x}>{x}</IdText>)}</div>
      <RecoveryGateLine />
    </div>
  );
}
