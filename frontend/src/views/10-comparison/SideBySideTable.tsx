import { useT } from "../../language";
import { IdText } from "../../semiontics";
import { METRIC_TERM, MetricValue, type MetricVM } from "../_common";

export function SideBySideTable({ ms }: { ms: MetricVM[] }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("ui.metric")}</h2>
      <table className="data"><tbody>{ms.map((m) => (
        <tr key={m.key} data-metric={m.id}><td><IdText>{m.id}</IdText> {t(METRIC_TERM[m.id] ?? "metric.mid")}</td>
          <td><MetricValue m={m} /></td></tr>))}</tbody></table>
    </div>
  );
}
