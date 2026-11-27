// View 11 — Event timeline (G04.4). SEM-010, 011, 023, 030, 032; endpoint #9 (RANGE).
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { FocusScope, OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton, ViewFrame } from "../_common";
import { DualTrackList } from "./DualTrackList";
import { type EventsProjection, resolveResonance, resonanceVM } from "./model";

export function TimelineView() {
  const t = useT();
  const { session, setFocus } = useSession();
  const ev = useProjection<EventsProjection>(ep.events(session));
  return (
    <ViewFrame id="v11" title="view.11" composition="plate" head={<>
      {session.from !== null && session.to !== null ? <span className="mono-value">{t("ui.range", { a: session.from, b: session.to })}</span> : null}
      {ev.data ? <><OriginBadge origin={ev.data.header.data_origin} /><ProvButton title="view.11" header={ev.data.header} raw={ev.data} /></> : null}</>}>
      <Guarded v={ev}>{(e) => (
        <div className="stack">
          <FocusScope focus={session.focus} vm={resonanceVM(e)} resolveResonance={resolveResonance} onFocus={setFocus}
            ids={resonanceVM(e).items.map((x) => x.id)}>
          <DualTrackList e={e} />
          </FocusScope>
        </div>
      )}</Guarded>
    </ViewFrame>
  );
}
export default TimelineView;
