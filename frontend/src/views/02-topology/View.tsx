// View 02 — Topology (G04.4). SEM-001–009, 023, 024, 031, 035, 037; endpoints #10, #12, #5, #6, #7 PER_TICK.
import { useState } from "react";
import { ep, useProjection } from "../../access";
import type { MetricsProjection, ObservationProjection, ResultsProjection, StateProjection, TopologyProjection } from "../../access";
import { useT } from "../../language";
import { useSession } from "../../session";
import { GuardedAll, ProvButton, ViewFrame } from "../_common";
import { layout } from "./layout";
import { Legend } from "./Legend";
import { couplings, nodeStates, resolveResonance, resonanceVM } from "./model";
import { FocusScope } from "../../semiontics";
import { OverlayToolbar } from "./OverlayToolbar";
import { TopologyCanvas } from "./TopologyCanvas";

export function TopologyView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const [show, setShow] = useState({ a: true, o: true, r: true });
  const tp = useProjection<TopologyProjection>(ep.topology(session));
  const st = useProjection<StateProjection>(ep.states(session));
  const ob = useProjection<ObservationProjection>(ep.observations(session));
  const rs = useProjection<ResultsProjection>(ep.results(session, "merged"));
  const mt = useProjection<MetricsProjection>(ep.metricsTick(session));
  const rec = rs.data?.reconstruction ?? null;
  return (
    <ViewFrame id="v02" title="view.02" composition="plate" head={
        <OverlayToolbar show={show} set={(k) => setShow({ ...show, [k]: !show[k] })}
          origins={{ a: st.data?.header.data_origin ?? null, o: ob.data?.observation.origin ?? null, r: rec?.origin ?? null }} />}>
      <GuardedAll vs={[tp, st, ob, rs, mt] as const}>{([p, s, o, r, m]) => (
        <>
          <FocusScope focus={session.focus} vm={resonanceVM(p.topology)} resolveResonance={resolveResonance} onFocus={setFocus}
            ids={[...p.topology.nodes.map((n) => n.node_id), ...p.topology.relations.map((x) => x.relation_id)]}>
          <TopologyCanvas l={layout(p.topology)} focus={session.focus} show={show} coupling={couplings(r.reconstruction)}
            nodes={nodeStates(s, o, r.reconstruction, m)} />
          </FocusScope>
          <Legend />
          <div className="row"><ProvButton title="view.02" header={p.header} raw={p.topology} /></div>
        </>
      )}</GuardedAll>
    </ViewFrame>
  );
}
export default TopologyView;
