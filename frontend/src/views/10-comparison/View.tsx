// View 10 — Scenario comparison (G04.4). SEM-010–012, 020–022; endpoints #17, #18.
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { FocusScope } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
import { BucketBoard } from "./BucketBoard";
import { ComparisonBanner } from "./ComparisonBanner";
import { ComparisonSelector } from "./ComparisonSelector";
import { buckets, type ComparisonResponse, type ComparisonsResponse, comparisonMetrics, entryFocusId, resolveResonance, resonanceVM } from "./model";
import { SideBySideTable } from "./SideBySideTable";

export function ComparisonView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const list = useProjection<ComparisonsResponse>(ep.comparisons(session));
  const cmp = useProjection<ComparisonResponse>(session.comparisonId ? ep.comparison(session) : null);
  return (
    <ViewFrame id="v10" title="view.10" composition="reserve" head={<>
      <Guarded v={list}>{(l) => <ComparisonSelector list={l} />}</Guarded>
      <span className="chip scope-badge" data-term="guard.timeless">{t("guard.timeless")}</span></>}>
      {session.comparisonId === null ? <p className="secondary">{t("cmp.none")}</p> : (
        <Guarded v={cmp}>{(c) => (
          <div className="stack">
            <ComparisonBanner c={c.comparison} />
            {c.comparison.compatible ? <>
              <FocusScope focus={session.focus} vm={resonanceVM(buckets(c.comparison))} resolveResonance={resolveResonance} onFocus={setFocus}
                ids={buckets(c.comparison).flatMap((x) => x.items.map(entryFocusId))}>
              <BucketBoard bs={buckets(c.comparison)} />
              </FocusScope>
              <SideBySideTable ms={comparisonMetrics(c.comparison)} />
            </> : null}
            <ProvButton title="view.10" header={c.header} raw={c.comparison} />
          </div>
        )}</Guarded>)}
    </ViewFrame>
  );
}
export default ComparisonView;
