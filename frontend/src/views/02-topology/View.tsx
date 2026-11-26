// View 02 — Topology (G04.4). SEM-001–009, 023, 024, 031, 035, 037; endpoints #10, #12, #5, #6, #7 PER_TICK.
import { useState } from "react";
import { ep, useProjection } from "../../access";
import type { MetricsProjection, ObservationProjection, ResultsProjection, StateProjection, TopologyProjection } from "../../access";
import { useT } from "../../language";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { layout } from "./layout";
import { Legend } from "./Legend";
import { couplings, nodeStates } from "./model";
import { OverlayToolbar } from "./OverlayToolbar";
import { TopologyCanvas } from "./TopologyCanvas";

export function TopologyView() {
  const t = useT();
  const { session } = useSession();
  const [show, setShow] = useState({ a: true, o: true, r: true });
  const tp = useProjection<TopologyProjection>(ep.topology(session));
  const st = useProjection<StateProjection>(ep.states(session));
  const ob = useProjection<ObservationProjection>(ep.observations(session));
  const rs = useProjection<ResultsProjection>(ep.results(session, "merged"));
  const mt = useProjection<MetricsProjection>(ep.metricsTick(session));
  const rec = rs.data?.reconstruction ?? null;
  return (
    <section aria-labelledby="v02">
      <div className="view-head"><h1 id="v02" className="view-title">{t("view.02")}</h1>
        <OverlayToolbar show={show} set={(k) => setShow({ ...show, [k]: !show[k] })}
          origins={{ a: st.data?.header.data_origin ?? null, o: ob.data?.observation.origin ?? null, r: rec?.origin ?? null }} />
      </div>
      <Guarded v={tp}>{(p) => (
        <>
          <TopologyCanvas l={layout(p.topology)} focus={session.focus} show={show} coupling={couplings(rec)}
            nodes={nodeStates(st.data, ob.status === "READY" ? ob.data : null, rs.status === "READY" ? rec : null, mt.data)} />
          <Legend />
          <div className="row"><ProvButton title="view.02" header={p.header} raw={p.topology} /></div>
        </>
      )}</Guarded>
    </section>
  );
}
export default TopologyView;
