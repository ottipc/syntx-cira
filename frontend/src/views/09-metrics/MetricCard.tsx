import { useT } from "../../language";
import { IdText } from "../../semiontics";
import { METRIC_EXPLAIN, METRIC_TERM, MetricValue, type MetricVM } from "../_common";
import { REL_TERMS } from "./model";

export function MetricCard({ m }: { m: MetricVM }) {
  const t = useT();
  const aux = Object.entries(m.result.aux).filter(([, v]) => v !== null && typeof v !== "object");
  return (
    <article className="panel metric-card" data-metric={m.id} data-relation={m.relation}>
      <header className="row"><IdText>{m.id}</IdText><strong>{t(METRIC_TERM[m.id] ?? "metric.mid")}</strong>
        <span className="secondary" data-relation-terms={m.relation}>{(REL_TERMS[m.relation as keyof typeof REL_TERMS] ?? []).map((k) => t(k)).join(" ↔ ")}</span>
        {m.subset ? <span className="secondary">{t(m.subset === "OBSERVABLE_CASES" ? "match.subset.observable" : "match.subset.all")}</span> : null}
        {m.result.aux.function_ref ? <IdText>{m.result.aux.function_ref}</IdText> : null}</header>
      <MetricValue m={m} />
      <p className="secondary micro">{t(METRIC_EXPLAIN[m.id] ?? "metric.mid")}</p>
      {m.def ? <p className="mono-id micro">{m.def.formula}</p> : null}
      {aux.length ? <p className="mono-id micro">{aux.map(([k, v]) => `${k}=${String(v)}`).join(" · ")}</p> : null}
    </article>
  );
}
