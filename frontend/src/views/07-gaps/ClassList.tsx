import { useT } from "../../language";
import { RuleDiamond } from "../../semiontics";
import { useSession } from "../../session";
import { FocusIdCell, FocusTr } from "../_common";
import { caseRowId, type ClassVM, VERDICT } from "./model";

export function ClassList({ cs }: { cs: ClassVM[] }) {
  const t = useT();
  const { session } = useSession();
  return (
    <div className="panel"><h2 className="section-title">{t("match.by_group")}</h2>
      {cs.length ? cs.map((c) => (
        <div key={c.key} className="stack" data-class={c.key}><h3 className="mono-id">{c.key}</h3>
          <table className="data"><tbody>{c.members.map((g) => {
            const v = VERDICT[g.verdict] ?? VERDICT.FN;
            const id = caseRowId(g);
            return (
              <FocusTr key={`${g.tick}:${id}`} id={id} className={session.focus === id ? "is-focused" : ""} {...(session.focus === id ? { "data-sem": "SEM-034" } : {})}>
                <td className="mono-value">{t("ui.tick", { t: g.tick })}</td>
                <td>{v ? <RuleDiamond sem={v.sem} term={v.term} /> : null}</td>
                <FocusIdCell id={id} />
                <td className="secondary">{g.observable === false ? t("ui.not_observable") : g.observable ? t("ui.observable") : ""}</td>
              </FocusTr>);
          })}</tbody></table>
        </div>)) : <p className="secondary">{t("msg.no_data")}</p>}
    </div>
  );
}
