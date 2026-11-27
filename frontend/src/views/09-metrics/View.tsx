// View 09 — Structural metrics (G04.4). SEM-013–017, 021, 022; endpoint #7 (POOLED | PER_TICK | TIME_MEAN_EXPLICIT).
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { FocusScope, OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
import { AggregationBar } from "./AggregationBar";
import { MetricBand } from "./MetricBand";
import { bands, type ExperimentViewResponse, type MetricsProjection, resolveResonance, resonanceVM } from "./model";
import { StrategyStrip } from "./StrategyStrip";

export function MetricsView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const x = useProjection<ExperimentViewResponse>(ep.experiment(session));
  const mt = useProjection<MetricsProjection>(ep.metrics(session));
  return (
    <ViewFrame id="v09" title="view.09" composition="reserve" head={<>
      <AggregationBar lastTick={x.data?.experiment.ticks.last ?? session.tick} />
      {(session.aggregation ?? "POOLED") !== "PER_TICK" ? <span className="chip scope-badge" data-term="guard.timeless">{t("guard.timeless")}</span> : null}</>}>
      <Guarded v={mt}>{(m) => (
        <div className="stack">
          <div className="row"><OriginBadge origin={m.report.data_origin} />
            {m.report.data_origin === "FIXTURE" ? <span className="secondary">{t("msg.fixture_note")}</span> : null}
            <ProvButton title="view.09" header={m.header} raw={m.report.results} strategies={m.report.strategies} /></div>
          <StrategyStrip strategies={m.report.strategies} />
          <p className="secondary" data-term="msg.no_composite">{t("msg.no_composite")}</p>
          <FocusScope focus={session.focus} vm={resonanceVM(m)} resolveResonance={resolveResonance} onFocus={setFocus}
            ids={bands(m).flatMap((b) => b.items.map((x) => x.focusId))}>
          {bands(m).map((b) => <MetricBand key={b.term} term={b.term} items={b.items} />)}
          </FocusScope>
          <p className="secondary micro">{t("metric.closure_in_comparison")}</p>
        </div>
      )}</Guarded>
    </ViewFrame>
  );
}
export default MetricsView;
