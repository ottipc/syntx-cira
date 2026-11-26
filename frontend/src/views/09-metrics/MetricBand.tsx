import { useT, type TermKey } from "../../language";
import type { MetricVM } from "../_common";
import { MetricCard } from "./MetricCard";

export function MetricBand({ term, items }: { term: TermKey; items: MetricVM[] }) {
  const t = useT();
  return (
    <section className="stack" data-band={term}><h2 className="section-title">{t(term)}</h2>
      {items.length ? <div className="grid-3">{items.map((m) => <MetricCard key={m.key} m={m} />)}</div> : <p className="secondary">{t("msg.no_data")}</p>}
    </section>
  );
}
