// View 09 — Structural metrics (G04.4). SEM-013–017, 021, 022; endpoint #7 (POOLED | PER_TICK | TIME_MEAN_EXPLICIT).
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { AggregationBar } from "./AggregationBar";
import { MetricBand } from "./MetricBand";
import { bands, type ExperimentViewResponse, type MetricsProjection } from "./model";
import { StrategyStrip } from "./StrategyStrip";

export function MetricsView() {
  const t = useT();
  const { session } = useSession();
  const x = useProjection<ExperimentViewResponse>(ep.experiment(session));
  const mt = useProjection<MetricsProjection>(ep.metrics(session));
  return (
    <section aria-labelledby="v09">
      <div className="view-head"><h1 id="v09" className="view-title">{t("view.09")}</h1>
        <AggregationBar lastTick={x.data?.experiment.ticks.last ?? session.tick} /></div>
      <Guarded v={mt}>{(m) => (
        <div className="stack">
          <div className="row"><OriginBadge origin={m.report.data_origin} />
            {m.report.data_origin === "FIXTURE" ? <span className="secondary">{t("msg.fixture_note")}</span> : null}
            <ProvButton title="view.09" header={m.header} raw={m.report.results} strategies={m.report.strategies} /></div>
          <StrategyStrip strategies={m.report.strategies} />
          <p className="secondary" data-term="msg.no_composite">{t("msg.no_composite")}</p>
          {bands(m).map((b) => <MetricBand key={b.term} term={b.term} items={b.items} />)}
          <p className="secondary micro">{t("metric.closure_in_comparison")}</p>
        </div>
      )}</Guarded>
    </section>
  );
}
export default MetricsView;
