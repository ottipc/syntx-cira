import { useT } from "../../language";
import { FocusHandle, FocusMarks, IdText, useFocusItem } from "../../semiontics";
import { METRIC_EXPLAIN, METRIC_TERM, MetricValue, type MetricVM } from "../_common";
import { REL_TERMS } from "./model";

/** Auxiliary counts (aux) are raw contract fields: they appear in the technical record only (INV-LANG-04). */
export function MetricCard({ m }: { m: MetricVM }) {
  const t = useT();
  const f = useFocusItem(m.focusId);
  return (
    <article className="panel metric-card" data-metric={m.id} data-relation={m.relation} {...f.attrs}>
      <FocusMarks id={m.focusId} />
      <header className="row"><FocusHandle id={m.focusId}><IdText>{m.id}</IdText></FocusHandle><strong>{t(METRIC_TERM[m.id] ?? "metric.mid")}</strong>
        <span className="secondary" data-relation-terms={m.relation}>{(REL_TERMS[m.relation as keyof typeof REL_TERMS] ?? []).map((k) => t(k)).join(` ${t("ui.vs")} `)}</span>
        {m.subset ? <span className="secondary">{t(m.subset === "OBSERVABLE_CASES" ? "match.subset.observable" : "match.subset.all")}</span> : null}
        {m.result.aux.function_ref ? <IdText>{m.result.aux.function_ref}</IdText> : null}</header>
      <MetricValue m={m} />
      <p className="secondary explain">{t(METRIC_EXPLAIN[m.id] ?? "metric.mid")}</p>
      {m.def ? <p className="mono-id" data-datum="formula">{m.def.formula}</p> : null}
    </article>
  );
}
