import type { SourceReferenceRegister } from "../../access";
import { useT } from "../../language";
import { FocusIdCell, FocusTr } from "../_common";
import { ContinuityBand, IdText } from "../../semiontics";

export function ContinuityMatrix({ reg, lastTick }: { reg: SourceReferenceRegister; lastTick: number }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("obs.sources")}</h2>
      <table className="data"><tbody>
        {reg.entries.map((e) => (
          <FocusTr key={e.source_id} id={e.source_id} data-source={e.source_id}><FocusIdCell id={e.source_id} />
            <td><ContinuityBand first={e.first_tick} last={e.last_tick} gaps={e.gaps ?? []} lastTick={lastTick} continuity={e.continuity} /></td></FocusTr>
        ))}
      </tbody></table>
    </div>
  );
}
