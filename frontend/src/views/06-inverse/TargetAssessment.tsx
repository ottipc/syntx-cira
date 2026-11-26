import type { TargetAssessment1 as TA } from "../../access";
import { useT } from "../../language";
import { IdText, RuleDiamond, SpaceCell } from "../../semiontics";
import { ASSESS } from "./model";

export function TargetAssessment({ items }: { items: readonly TA[] }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("target.assessment")}</h2>
      <table className="data"><tbody>{items.map((a) => {
        const m = ASSESS[a.status] ?? { sem: "SEM-007" as const, term: "target.undetermined" as const };
        return (<tr key={a.goal_id} data-goal={a.goal_id}><td><IdText>{a.goal_id}</IdText></td>
          <td>{m.sem === "SEM-007" ? <SpaceCell sem="SEM-007" space="R" term={m.term} /> : <RuleDiamond sem={m.sem} term={m.term} />}</td>
          <td>{(a.derived_from ?? []).map((d: string) => <IdText key={d}>{d}</IdText>)}</td></tr>);
      })}</tbody></table>
    </div>
  );
}
