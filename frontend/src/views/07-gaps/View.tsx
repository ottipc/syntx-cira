// View 07 — Structural gaps (G04.4). SEM-010, 011, 024, 025, 031, 034; endpoints #6 (merged), #7 (POOLED).
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { FocusScope, OriginBadge, SpaceCell } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
import { ClassList } from "./ClassList";
import { GapDetail } from "./GapDetail";
import { MatchSummary } from "./MatchSummary";
import { caseRowId, classes, matchMetrics, type MetricsProjection, openGaps, resolveResonance, resonanceVM, type ResultsProjection } from "./model";
import { SubsetToggle } from "./SubsetToggle";

export function GapsView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const obsOnly = session.filter === "observable";
  const mt = useProjection<MetricsProjection>(ep.metrics({ ...session, aggregation: "POOLED", toTick: null }));
  const rs = useProjection<ResultsProjection>(ep.results(session, "merged"));
  return (
    <ViewFrame id="v07" title="view.07" composition="reserve" head={<SubsetToggle />}>
      <Guarded v={mt}>{(m) => (
        <div className="stack">
          <div className="row"><OriginBadge origin={m.report.data_origin} /><ProvButton title="view.07" header={m.header} raw={m.report.gap_matches} strategies={m.report.strategies} /></div>
          <MatchSummary ms={matchMetrics(m, obsOnly)} />
          <FocusScope focus={session.focus} onFocus={setFocus} resolveResonance={resolveResonance}
            vm={resonanceVM(m, openGaps(rs.data?.reconstruction.content?.output.gaps))}
            ids={[...classes(m, obsOnly).flatMap((c) => c.members.map(caseRowId)), ...openGaps(rs.data?.reconstruction.content?.output.gaps).map((g) => g.gap_id)]}>
          <div className="grid-2">
            <ClassList cs={classes(m, obsOnly)} />
            <Guarded v={rs}>{(r) => r.reconstruction.availability === "AVAILABLE" && r.reconstruction.content
              ? <GapDetail gaps={openGaps(r.reconstruction.content.output.gaps)} focus={session.focus} />
              : <SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} />}</Guarded>
          </div>
          </FocusScope>
        </div>
      )}</Guarded>
    </ViewFrame>
  );
}
export default GapsView;
