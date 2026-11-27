// View 01 — System overview (G04.4). SEM-001–003, 019, 020, 032; endpoints #20, #4.
import { ep, useProjection } from "../../access";
import type { ExperimentViewResponse, FieldsResponse } from "../../access";
import { useT } from "../../language";
import { ExecPill, FocusScope, OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { BarrierOverlay } from "./BarrierOverlay";
import { ConfigSnapshot } from "./ConfigSnapshot";
import { LayerChain } from "./LayerChain";
import { fieldFocusId, layers, pipeline, resolveResonance, resonanceVM, STAGES, stageId } from "./model";
import { OpennessStrip } from "./OpennessStrip";
import { StagePipeline } from "./StagePipeline";

export function OverviewView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const x = useProjection<ExperimentViewResponse>(ep.experiment(session));
  const f = useProjection<FieldsResponse>(ep.fields(session, true));
  return (
    <section aria-labelledby="v01">
      <Guarded v={x}>{(e) => (
        <>
          <div className="view-head"><h1 id="v01" className="view-title">{t("view.01")}</h1>
            <ExecPill status={e.experiment.status} /><OriginBadge origin={e.experiment.data_origin} />
            <ProvButton title="view.01" header={e.header} raw={e.experiment} /></div>
          <FocusScope focus={session.focus} onFocus={setFocus} resolveResonance={resolveResonance}
            vm={resonanceVM(f.data)}
            ids={[...(f.data?.manifests ?? []).map((m) => fieldFocusId(m.field_id)), ...STAGES.map(stageId)]}>
          <Guarded v={f}>{(fd) => <LayerChain layers={layers(fd)} />}</Guarded>
          <BarrierOverlay />
          <div className="grid-2">
            <StagePipeline stages={pipeline(e.experiment)} />
            <div className="stack"><OpennessStrip o={e.experiment.openness} tick={session.tick} />
              <Guarded v={f}>{(fd) => <ConfigSnapshot c={fd.configuration_snapshot} />}</Guarded></div>
          </div>
          </FocusScope>
        </>
      )}</Guarded>
    </section>
  );
}
export default OverviewView;
