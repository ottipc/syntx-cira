import type { SourceReferenceRegister } from "../../access";
import { useT } from "../../language";
import { ContinuityBand, IdText } from "../../semiontics";

export function ContinuityMatrix({ reg, lastTick }: { reg: SourceReferenceRegister; lastTick: number }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("obs.sources")}</h2>
      <table className="data"><tbody>
        {reg.entries.map((e) => (
          <tr key={e.source_id} data-source={e.source_id}><td><IdText>{e.source_id}</IdText></td>
            <td><ContinuityBand first={e.first_tick} last={e.last_tick} gaps={e.gaps ?? []} lastTick={lastTick} continuity={e.continuity} /></td></tr>
        ))}
      </tbody></table>
    </div>
  );
}
