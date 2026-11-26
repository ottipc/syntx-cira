// View 06 — Target-guided reconstruction (G04.4). SEM-003, 007, 010, 011, 027, 029; endpoints #6 (inverse), #14.
import { ep, useProjection } from "../../access";
import type { ResultsProjection, TraceProjection } from "../../access";
import { useT } from "../../language";
import { IdText, SpaceCell } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { OutputTabs, RunHeader, TraceTimeline } from "../_common/RunParts";
import { inverseOf } from "./model";
import { TargetAssessment } from "./TargetAssessment";

export function InverseView() {
  const t = useT();
  const { session } = useSession();
  const rs = useProjection<ResultsProjection>(ep.results(session, "inverse"));
  const tr = useProjection<TraceProjection>(ep.trace(session, "inv"));
  return (
    <section aria-labelledby="v06">
      <Guarded v={rs}>{(r) => {
        const f = inverseOf(r.inverse);
        if (!f) return <><h1 id="v06" className="view-title">{t("view.06")}</h1><SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} /></>;
        return (
          <div className="stack">
            <RunHeader run={f.run} origin={f.origin} title="view.06"><span>· {t("target")}</span>
              {f.run.target_ref ? <IdText>{f.run.target_ref.artifact_id}</IdText> : null}<span>· {t("target.basis")}</span></RunHeader>
            <TargetAssessment items={f.ta} />
            <div className="grid-2"><Guarded v={tr}>{(x) => <TraceTimeline tr={x} independentNote />}</Guarded><OutputTabs out={f.out} /></div>
            <ProvButton title="run.inverse" header={r.header} raw={r.inverse} />
          </div>
        );
      }}</Guarded>
    </section>
  );
}
export default InverseView;
