import { useT } from "../../language";
import { IdText } from "../../semiontics";
import { sessionUrl, useSession } from "../../session";
import { METRIC_TERM, type MetricVM } from "../_common";

/** TP / FN / FP counts exactly as the server reports them (aux, K-74). Metric values are shown in view 09
 *  (SEM-021/022 are registered for views 08–10), reached by the link. */
export function MatchSummary({ ms }: { ms: MetricVM[] }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const href = sessionUrl({ ...session, view: "STRUCTURAL_METRICS", aggregation: "POOLED" });
  return (
    <div className="panel"><h2 className="section-title">{t("match.matcher")}</h2>
      <table className="data"><tbody>{ms.map((m) => (
        <tr key={m.key} data-metric={m.id}><td><IdText>{m.id}</IdText> {t(METRIC_TERM[m.id] ?? "metric.mid")}</td>
          <td className="mono-value">{`${t("match.tp")} ${m.result.aux.tp ?? "—"} · ${t("match.fn")} ${m.result.aux.fn ?? "—"} · ${t("match.fp")} ${m.result.aux.fp ?? "—"}`}</td>
          <td><a href={href} onClick={(e) => { e.preventDefault(); goUrl(href); }}>▸ {t("view.09")}</a></td></tr>))}</tbody></table>
    </div>
  );
}
