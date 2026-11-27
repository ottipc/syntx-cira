import { useT } from "../../language";
import { sessionUrl, useSession } from "../../session";
import { GapMark, IdText } from "../../semiontics";
import { FocusIdCell, FocusTr } from "../_common";
import type { StructuralGap } from "./model";

export function GapDetail({ gaps, focus }: { gaps: StructuralGap[]; focus: string | null }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("ui.gaps")}</h2>
      {gaps.length ? <table className="data"><tbody>{gaps.map((g) => (
        <FocusTr key={g.gap_id} id={g.gap_id} data-gap={g.gap_id} className={focus === g.gap_id ? "is-focused" : ""} {...(focus === g.gap_id ? { "data-sem": "SEM-034" } : {})}>
          <FocusIdCell id={g.gap_id} /><td><GapMark status={g.status} sources={g.source_refs.length} /></td>
          <td><span className="secondary">{t("gap.subjects")}</span> {g.subject_refs.map((s) => <SubjectLink key={s} id={s} />)}</td>
          <td><span className="secondary">{t("gap.sources")}</span> {g.source_refs.map((s) => <IdText key={s}>{s}</IdText>)}</td></FocusTr>
      ))}</tbody></table> : <p className="secondary">{t("msg.no_data")}</p>}
    </div>
  );
}

/** A gap subject opens the view where it is drawn, with the subject as focus (06.07): node → 02, attribute → 03. */
function SubjectLink({ id }: { id: string }) {
  const { session, goUrl } = useSession();
  const view = id.startsWith("node:") ? "TOPOLOGY_GRAPH" : id.startsWith("attr:") ? "TEMPORAL_STATE_EXPLORER" : null;
  if (!view) return <IdText>{id}</IdText>;
  const href = sessionUrl({ ...session, view, focus: id });
  return <a href={href} className="subject-link" onClick={(e) => { e.preventDefault(); goUrl(href); }}><IdText>{id}</IdText></a>;
}
