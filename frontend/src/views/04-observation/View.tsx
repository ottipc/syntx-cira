// View 04 — Observation details (G04.4). SEM-002, 004–006, 008, 030; endpoint #5 (K-65).
import { ep, useProjection } from "../../access";
import type { ExperimentViewResponse, ObservationProjection } from "../../access";
import { useT } from "../../language";
import { OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { BudgetGauge } from "./BudgetGauge";
import { ContextChain } from "./ContextChain";
import { ContinuityMatrix } from "./ContinuityMatrix";
import { resolveResonance, resonanceVM, rows } from "./model";
import { FocusScope } from "../../semiontics";
import { ObservationTable } from "./ObservationTable";

export function ObservationView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const ob = useProjection<ObservationProjection>(ep.observations(session));
  const x = useProjection<ExperimentViewResponse>(ep.experiment(session));
  const ticks = x.data ? x.data.experiment.ticks.last : session.tick;
  return (
    <section aria-labelledby="v04">
      <Guarded v={ob}>{(o) => (
        <>
          <div className="view-head"><h1 id="v04" className="view-title">{t("view.04")}</h1>
            <span className="mono-value">{t("ui.tick", { t: session.tick })}</span>
            {o.observation.content ? <span className="mono-id">{t("obs.revision")} {String(o.observation.content.revision)}</span> : null}
            <OriginBadge origin={o.header.data_origin} /><ProvButton title="view.04" header={o.header} raw={o.observation} /></div>
          {o.observation.availability === "AVAILABLE" && o.observation.content ? (
            <FocusScope focus={session.focus} vm={resonanceVM(rows(o.observation.content))} resolveResonance={resolveResonance} onFocus={setFocus}
              ids={[...o.observation.content.context.observations.map((x) => x.observation_id), ...o.observation.content.source_register.entries.map((x) => x.source_id)]}>
            <div className="stack">
              <div className="grid-3"><ContextChain c={o.observation.content.context} /><BudgetGauge b={o.observation.content} /></div>
              <div className="grid-2">
                <ContinuityMatrix reg={o.observation.content.source_register} lastTick={ticks} />
                <ObservationTable rows={rows(o.observation.content)} tick={session.tick} />
              </div>
            </div>
            </FocusScope>
          ) : <p className="secondary">{t("msg.no_data")}</p>}
        </>
      )}</Guarded>
    </section>
  );
}
export default ObservationView;
