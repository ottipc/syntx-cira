// View 03 — State comparison (G04.4). SEM-001–009, 018, 023, 031, 035; endpoints #12, #5, #6, #11, #7 PER_TICK.
import { ep, useProjection } from "../../access";
import type { GovernanceProjection, MetricsProjection, ObservationProjection, ResultsProjection, StateProjection } from "../../access";
import { useT } from "../../language";
import { sessionUrl, useSession } from "../../session";
import { GuardedAll, ProvButton } from "../_common";
import { Filters } from "./Filters";
import { buildRows, resolveResonance, resonanceVM, ribbon } from "./model";
import { FocusScope } from "../../semiontics";
import { StateGrid } from "./StateGrid";

export function StateView() {
  const t = useT();
  const { session, goUrl, setFocus } = useSession();
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
      <GuardedAll vs={[st, ob, rs, ga, go_, gr, mt] as const}>{([s, o, r, a, oo, rr, m]) => {
        const rec = r.reconstruction;
        const rows = buildRows(s, o, rec, m.report.attribute_membership ?? [], session.filter);
        return (
          <>
            <FocusScope focus={session.focus} vm={resonanceVM([a.evaluations.content ?? null, oo.evaluations.content ?? null, rr.evaluations.content ?? null])}
              ids={rows.map((x) => x.attribute)} resolveResonance={resolveResonance} onFocus={setFocus}>
            <StateGrid rows={rows} focus={session.focus} tick={session.tick}
              origins={{ a: s.header.data_origin, o: o.observation.origin ?? null, r: rec.origin ?? null }}
              ribbons={[ribbon("A", a.evaluations.content ?? null), ribbon("O", oo.evaluations.content ?? null),
                ribbon("R", rr.evaluations.content ?? null)]} />
            </FocusScope>
            {rec.availability === "NOT_AVAILABLE_AT_TICK" ? (
              <p className="secondary">{t("avail.none", { t: session.tick })} ·{" "}
                <a href={sessionUrl({ ...session, view: "EVENT_TIMELINE" })} onClick={(e) => { e.preventDefault(); goUrl(sessionUrl({ ...session, view: "EVENT_TIMELINE" })); }}>
                  {t("view.11")}</a></p>) : null}
            <div className="row"><ProvButton title="space.a" header={s.header} raw={s} />
              <ProvButton title="space.o" header={o.header} raw={o.observation} />
              <ProvButton title="space.r" header={r.header} raw={rec} /></div>
          </>
        );
      }}</GuardedAll>
    </section>
  );
}
export default StateView;
