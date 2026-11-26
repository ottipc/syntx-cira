// View 03 — State comparison (G04.4). SEM-001–009, 018, 023, 031, 035; endpoints #12, #5, #6, #11, #7 PER_TICK.
import { ep, useProjection } from "../../access";
import type { GovernanceProjection, MetricsProjection, ObservationProjection, ResultsProjection, StateProjection } from "../../access";
import { useT } from "../../language";
import { sessionUrl, useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { Filters } from "./Filters";
import { buildRows, ribbon } from "./model";
import { StateGrid } from "./StateGrid";

export function StateView() {
  const t = useT();
  const { session, goUrl } = useSession();
  const st = useProjection<StateProjection>(ep.states(session));
  const ob = useProjection<ObservationProjection>(ep.observations(session));
  const rs = useProjection<ResultsProjection>(ep.results(session, "merged"));
  const ga = useProjection<GovernanceProjection>(ep.governance(session, "A"));
  const go_ = useProjection<GovernanceProjection>(ep.governance(session, "O"));
  const gr = useProjection<GovernanceProjection>(ep.governance(session, "R"));
  const mt = useProjection<MetricsProjection>(ep.metricsTick(session));
  return (
    <section aria-labelledby="v03">
      <div className="view-head">
        <h1 id="v03" className="view-title">{t("view.03")}</h1>
        <span className="mono-value">{t("ui.tick", { t: session.tick })} · {t("run.attempt", { n: session.attempt })}</span>
        <Filters />
      </div>
      <Guarded v={st}>{(s) => {
        const rec = rs.status === "READY" && rs.data ? rs.data.reconstruction : null;
        const rows = buildRows(s, ob.status === "READY" ? ob.data : null, rec,
          mt.status === "READY" && mt.data ? mt.data.report.attribute_membership ?? [] : [], session.filter);
        return (
          <>
            <StateGrid rows={rows} focus={session.focus} tick={session.tick} rUnavailable={rec?.availability === "NOT_AVAILABLE_AT_TICK"}
              origins={{ a: s.header.data_origin, o: ob.data?.observation.origin ?? null, r: rec?.origin ?? null }}
              ribbons={[ribbon("A", ga.data?.evaluations.content ?? null), ribbon("O", go_.data?.evaluations.content ?? null),
                ribbon("R", gr.data?.evaluations.content ?? null)]} />
            {rec?.availability === "NOT_AVAILABLE_AT_TICK" ? (
              <p className="secondary">{t("avail.none", { t: session.tick })} ·{" "}
                <a href={sessionUrl({ ...session, view: "EVENT_TIMELINE" })} onClick={(e) => { e.preventDefault(); goUrl(sessionUrl({ ...session, view: "EVENT_TIMELINE" })); }}>
                  {t("view.11")}</a></p>) : null}
            <div className="row"><ProvButton title="space.a" header={s.header} raw={s} />
              {ob.data ? <ProvButton title="space.o" header={ob.data.header} raw={ob.data.observation} /> : null}
              {rs.data ? <ProvButton title="space.r" header={rs.data.header} raw={rs.data.reconstruction} /> : null}</div>
          </>
        );
      }}</Guarded>
    </section>
  );
}
export default StateView;
