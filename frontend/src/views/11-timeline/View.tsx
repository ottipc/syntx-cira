// View 11 — Event timeline (G04.4). SEM-010, 011, 023, 030, 032; endpoint #9 (RANGE).
import { ep, useProjection } from "../../access";
import { useT } from "../../language";
import { OriginBadge } from "../../semiontics";
import { useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { DualTrackList } from "./DualTrackList";
import type { EventsProjection } from "./model";

export function TimelineView() {
  const t = useT();
  const { session } = useSession();
  const ev = useProjection<EventsProjection>(ep.events(session));
  return (
    <section aria-labelledby="v11">
      <Guarded v={ev}>{(e) => (
        <div className="stack">
          <div className="view-head"><h1 id="v11" className="view-title">{t("view.11")}</h1>
            {session.from !== null && session.to !== null ? <span className="mono-value">{t("ui.range", { a: session.from, b: session.to })}</span> : null}
            <OriginBadge origin={e.header.data_origin} /><ProvButton title="view.11" header={e.header} raw={e} /></div>
          <DualTrackList e={e} />
        </div>
      )}</Guarded>
    </section>
  );
}
export default TimelineView;
