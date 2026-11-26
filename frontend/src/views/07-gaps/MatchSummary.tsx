import { useT } from "../../language";
import { IdText } from "../../semiontics";
import { METRIC_TERM, MetricValue, type MetricVM } from "../_common";

/** TP / FN / FP counts and M07/M08 exactly as the server reports them (aux, K-74). */
export function MatchSummary({ ms }: { ms: MetricVM[] }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("match.matcher")}</h2>
      <table className="data"><tbody>{ms.map((m) => (
        <tr key={m.key} data-metric={m.id}><td><IdText>{m.id}</IdText> {t(METRIC_TERM[m.id] ?? "metric.mid")}</td>
          <td className="mono-value">{`${t("match.tp")} ${m.result.aux.tp ?? "—"} · ${t("match.fn")} ${m.result.aux.fn ?? "—"} · ${t("match.fp")} ${m.result.aux.fp ?? "—"}`}</td>
          <td><MetricValue m={m} /></td></tr>))}</tbody></table>
    </div>
  );
}
