import { useT } from "../../language";
import { GapMark, IdText } from "../../semiontics";
import type { StructuralGap } from "./model";

export function GapDetail({ gaps, focus }: { gaps: StructuralGap[]; focus: string | null }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("ui.gaps")}</h2>
      {gaps.length ? <table className="data"><tbody>{gaps.map((g) => (
        <tr key={g.gap_id} data-gap={g.gap_id} className={focus === g.gap_id ? "is-focused" : ""} {...(focus === g.gap_id ? { "data-sem": "SEM-034" } : {})}>
          <td><IdText>{g.gap_id}</IdText></td><td><GapMark status={g.status} sources={g.source_refs.length} /></td>
          <td><span className="secondary">{t("gap.subjects")}</span> {g.subject_refs.map((s) => <IdText key={s}>{s}</IdText>)}</td>
          <td><span className="secondary">{t("gap.sources")}</span> {g.source_refs.map((s) => <IdText key={s}>{s}</IdText>)}</td></tr>
      ))}</tbody></table> : <p className="secondary">{t("msg.no_data")}</p>}
    </div>
  );
}
