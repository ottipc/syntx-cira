import { useT } from "../../language";
import { IdText, SpaceCell } from "../../semiontics";
import type { ObsRow } from "./model";

export function ObservationTable({ rows, tick }: { rows: ObsRow[]; tick: number }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("obs.list")} ▸ {t("obs.projected", { t: tick })}</h2>
      <table className="data"><tbody>
        {rows.map((r) => (
          <tr key={r.id} data-observation={r.id}><td><IdText>{r.id}</IdText></td>
            <td><SpaceCell sem={r.sem} space="O" value={r.value} term={r.term} termParams={r.params}
              sub={r.source ? <IdText>{r.source}</IdText> : r.sem === "SEM-006" ? <span>{t("obs.no_source")}</span> : null} /></td></tr>
        ))}
      </tbody></table>
    </div>
  );
}
