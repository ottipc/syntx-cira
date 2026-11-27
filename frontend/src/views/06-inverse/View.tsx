// View 06 — Target-guided reconstruction (G04.4, architecture v2.0.3 06.06). SEM-003, 007, 010, 011, 027, 029; endpoints #6 (inverse), #14.
import { ep, useProjection } from "../../access";
import type { ResultsProjection, TraceProjection } from "../../access";
import { useT } from "../../language";
import { FocusScope, IdText, SpaceCell } from "../../semiontics";
import { sessionUrl, useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
import { resolveRunResonance, runResonanceVM } from "../_common/model";
import { OutputTabs, RunHeader, RunTitle, TraceTimeline } from "../_common/RunParts";
import { inverseOf } from "./model";
import { TargetAssessment } from "./TargetAssessment";

export function InverseView() {
  const t = useT();
  const { session, goUrl, setFocus } = useSession();
  const rs = useProjection<ResultsProjection>(ep.results(session, "inverse"));
  const tr = useProjection<TraceProjection>(ep.trace(session, "inv"));
  const f0 = rs.data ? inverseOf(rs.data.inverse) : null;
  // quick link to view 05 keeps tick and attempt (06.06); it is a navigation, not a reference to forward results
  const fwd = sessionUrl({ ...session, view: "FORWARD_SWEEP_INSPECTOR" });
  return (
    <ViewFrame id="v06" title="view.06" composition="reserve" head={f0 ? <>
      <RunTitle run={f0.run} origin={f0.origin} />
      <a href={fwd} onClick={(e) => { e.preventDefault(); goUrl(fwd); }} data-term="view.05">{"▸\u00a0"}{t("view.05")}</a></> : null}>
      <Guarded v={rs}>{(r) => {
        const f = inverseOf(r.inverse);
        if (!f) return <SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} />;
        return (
          <div className="stack">
            <RunHeader run={f.run}><span>· {t("target")}</span>
              {f.run.target_ref ? <IdText>{f.run.target_ref.artifact_id}</IdText> : null}<span>· {t("target.basis")}</span></RunHeader>
            <FocusScope focus={session.focus} vm={runResonanceVM(tr.data, f.ta)} resolveResonance={resolveRunResonance} onFocus={setFocus}
              ids={[...f.ta.map((g) => g.goal_id), ...(tr.data?.trace.content?.steps ?? []).map((x) => x.step_id), ...f.out.values.map((v) => v.attribute_ref)]}>
            <TargetAssessment items={f.ta} />
            <div className="grid-2"><Guarded v={tr}>{(x) => <TraceTimeline tr={x} independentNote />}</Guarded><OutputTabs out={f.out} /></div>
            </FocusScope>
            <ProvButton title="run.inverse" header={r.header} raw={r.inverse} />
          </div>
        );
      }}</Guarded>
    </ViewFrame>
  );
}
export default InverseView;
