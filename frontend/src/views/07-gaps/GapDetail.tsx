import { useT } from "../../language";
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
          <td><span className="secondary">{t("gap.subjects")}</span> {g.subject_refs.map((s) => <IdText key={s}>{s}</IdText>)}</td>
          <td><span className="secondary">{t("gap.sources")}</span> {g.source_refs.map((s) => <IdText key={s}>{s}</IdText>)}</td></FocusTr>
      ))}</tbody></table> : <p className="secondary">{t("msg.no_data")}</p>}
    </div>
  );
}
