// View 04 — Observation details (G04.4). SEM-002, 004–006, 008, 030; endpoint #5 (K-65).
import { ep, useProjection } from "../../access";
import type { ExperimentViewResponse, ObservationProjection } from "../../access";
import { useT } from "../../language";
import { OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
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
    <ViewFrame id="v04" title="view.04" composition="reserve" head={<>
      <span className="mono-value">{t("ui.tick", { t: session.tick })}</span>
      {ob.data?.observation.content ? <span className="mono-id">{t("obs.revision")} {String(ob.data.observation.content.revision)}</span> : null}
      {ob.data ? <><OriginBadge origin={ob.data.header.data_origin} /><ProvButton title="view.04" header={ob.data.header} raw={ob.data.observation} /></> : null}</>}>
      <Guarded v={ob}>{(o) => (
        <>
          {o.observation.availability === "AVAILABLE" && o.observation.content ? (
            <FocusScope focus={session.focus} vm={resonanceVM(rows(o.observation.content))} resolveResonance={resolveResonance} onFocus={setFocus}
              ids={[...o.observation.content.context.observations.map((x) => x.observation_id), ...o.observation.content.source_register.entries.map((x) => x.source_id)]}>
            <div className="stack">
              <div className="grid-3"><ContextChain c={o.observation.content.context} /><BudgetGauge b={o.observation.content} /></div>
              <div className="grid-2 grid-5-7">
                <ContinuityMatrix reg={o.observation.content.source_register} lastTick={ticks} />
                <ObservationTable rows={rows(o.observation.content)} tick={session.tick} />
              </div>
            </div>
            </FocusScope>
          ) : <p className="secondary">{t("msg.no_data")}</p>}
        </>
      )}</Guarded>
    </ViewFrame>
  );
}
export default ObservationView;
