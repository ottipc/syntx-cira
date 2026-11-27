// View 08 — Architectural closure (G04.4). SEM-010–012, 020–026, 029, 037; endpoints #6, #8 (R), #21 read-only.
import { useState } from "react";
import { ep, useProjection } from "../../access";
import { AuthorizeDialog } from "../../control/AuthorizeDialog";
import { useT } from "../../language";
import { ConflictBracket, FocusHandle, FocusScope, GapMark, IdText, OriginBadge, RecoveryGateLine, RuleDiamond, SpaceCell } from "../../semiontics";
import { useSession } from "../../session";
import { FocusBox, FocusIdCell, FocusTr, Guarded, ProvButton, ViewFrame } from "../_common";
import { DECISION, evaluations, type GovernanceProjection, REASON, RESULT, resolveResonance, resonanceVM, type ResultsProjection } from "./model";
import { Quadrant, QuadrantGrid } from "./QuadrantGrid";

export function ClosureView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const [auth, setAuth] = useState(false);
  const rs = useProjection<ResultsProjection>(ep.results(session, "merged"));
  const gv = useProjection<GovernanceProjection>(ep.governance(session, "R"));
  return (
    <ViewFrame id="v08" title="view.08" composition="reserve" head={<span className="mono-value">{t("ui.tick", { t: session.tick })}</span>}>
      <Guarded v={rs}>{(r) => {
        const c = r.reconstruction.availability === "AVAILABLE" ? r.reconstruction.content : null;
        const origin = r.reconstruction.origin ?? "SYNTHETIC";
        return (
          <FocusScope focus={session.focus} onFocus={setFocus} resolveResonance={resolveResonance}
            vm={resonanceVM(r.proposals, c?.output.gaps ?? [], c?.merge.conflicts ?? [])}
            ids={[...r.proposals.map((p) => p.proposal_id), ...(c?.output.gaps ?? []).map((g) => g.gap_id), ...(c?.merge.conflicts ?? []).map((x) => x.attribute_ref)]}>
          <QuadrantGrid>
            <Quadrant term="ui.quadrant.gaps">
              {c ? (c.output.gaps.length ? <ul className="stack">{c.output.gaps.map((g) => (
                <FocusBox as="li" key={g.gap_id} id={g.gap_id} className="row"><FocusHandle id={g.gap_id}><IdText>{g.gap_id}</IdText></FocusHandle><GapMark status={g.status} sources={g.source_refs.length} /></FocusBox>))}</ul>
                : <p className="secondary">{t("msg.no_data")}</p>) : <SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} />}
            </Quadrant>
            <Quadrant term="ui.quadrant.disagreements">
              {c ? (c.merge.conflicts.length ? <ul className="stack">{c.merge.conflicts.map((x) => (
                <FocusBox as="li" key={x.attribute_ref} id={x.attribute_ref}><FocusHandle id={x.attribute_ref}><IdText>{x.attribute_ref}</IdText></FocusHandle>{" "}
                  <ConflictBracket forward={x.forward ?? null} inverse={x.inverse ?? null} resolution={x.resolution} origin={origin} /></FocusBox>))}</ul>
                : <p className="secondary">{t("msg.no_data")}</p>) : <SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} />}
            </Quadrant>
            <Quadrant term="ui.quadrant.closure">
              <Guarded v={gv}>{(g) => (
                <table className="data"><tbody>{evaluations(g).map((e) => (
                  <tr key={e.rule_ref} data-rule={e.rule_ref}><td><IdText>{e.rule_ref}</IdText></td>
                    <td><RuleDiamond sem={RESULT[e.result].sem} term={RESULT[e.result].term} reason={e.result === "TRUE" ? null : REASON[e.reason]} /></td></tr>
                ))}</tbody></table>)}</Guarded>
            </Quadrant>
            <Quadrant term="ui.quadrant.recovery">
              <RecoveryGateLine />
              {r.proposals.length ? <table className="data"><tbody>{r.proposals.map((p) => (
                <FocusTr key={p.proposal_id} id={p.proposal_id} data-proposal={p.proposal_id}><FocusIdCell id={p.proposal_id} />
                  <td className="secondary">{p.description_from_engine}</td><td>{t("proposal.status")}</td></FocusTr>))}</tbody></table>
                : <p className="secondary">{t("msg.no_data")}</p>}
              {r.authority_records.map((a) => (
                <div key={a.decision_id} className="row" data-authority={a.decision_id}><IdText>{a.decision_id}</IdText>
                  <span>{t(DECISION[a.decision])}</span><IdText>{a.role_ref}</IdText></div>))}
              <div className="row">
                <button type="button" className="btn" onClick={() => setAuth(true)} data-term="action.authorize">{t("action.authorize")}</button>
                <OriginBadge origin={origin} /><ProvButton title="view.08" header={r.header} raw={{ proposals: r.proposals, authority: r.authority_records }} />
              </div>
              {auth ? <AuthorizeDialog onClose={() => setAuth(false)} /> : null}
            </Quadrant>
          </QuadrantGrid>
          </FocusScope>
        );
      }}</Guarded>
    </ViewFrame>
  );
}
export default ClosureView;
