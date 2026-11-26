import { useT } from "../../language";
import { IdText, RuleDiamond } from "../../semiontics";
import { useSession } from "../../session";
import { type ClassVM, VERDICT } from "./model";

export function ClassList({ cs }: { cs: ClassVM[] }) {
  const t = useT();
  const { session, go } = useSession();
  return (
    <div className="panel"><h2 className="section-title">{t("match.by_group")}</h2>
      {cs.length ? cs.map((c) => (
        <div key={c.key} className="stack" data-class={c.key}><h3 className="mono-id">{c.key}</h3>
          <table className="data"><tbody>{c.members.map((g) => {
            const v = VERDICT[g.verdict] ?? VERDICT.FN;
            const id = g.gap_id ?? g.case_id ?? "";
            return (
              <tr key={`${g.tick}:${id}`} className={session.focus === id ? "is-focused" : ""} {...(session.focus === id ? { "data-sem": "SEM-034" } : {})}>
                <td className="mono-value">{t("ui.tick", { t: g.tick })}</td>
                <td>{v ? <RuleDiamond sem={v.sem} term={v.term} /> : null}</td>
                <td><button type="button" className="link" onClick={() => go({ focus: id || null })}><IdText>{id}</IdText></button></td>
                <td className="secondary">{g.observable === false ? t("ui.not_observable") : g.observable ? t("ui.observable") : ""}</td>
              </tr>);
          })}</tbody></table>
        </div>)) : <p className="secondary">{t("msg.no_data")}</p>}
    </div>
  );
}
