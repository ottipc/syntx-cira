import type { ObservationProjectionBody } from "../../access";
import { useT } from "../../language";
import { IdText } from "../../semiontics";

export function BudgetGauge({ b }: { b: ObservationProjectionBody }) {
  const t = useT();
  return (
    <>
      <div className="panel"><h2 className="section-title">{t("obs.budget")}</h2>
        <div className="row"><span className="secondary">{t("obs.budget.items")}</span><span className="mono-value">{`${b.budget_usage.observations} / ${b.bundle_budget.max_observations}`}</span></div>
        <div className="row"><span className="secondary">{t("obs.budget.bytes")}</span><span className="mono-value">{`${b.budget_usage.bytes} / ${b.bundle_budget.max_bytes}`}</span></div>
      </div>
      <div className="panel"><h2 className="section-title">{t("obs.profile")}</h2>
        <div className="row"><IdText>{b.serialization_profile}</IdText><span className="secondary">{t("obs.revision")}</span><IdText>{String(b.revision)}</IdText></div>
        <div className="secondary">{t("ui.within_budget")}</div>
      </div>
    </>
  );
}
