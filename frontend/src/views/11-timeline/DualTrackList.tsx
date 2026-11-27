import { useT } from "../../language";
import { DeltaMark, ExecPill, FocusHandle, FocusMarks, IdText, RuleDiamond } from "../../semiontics";
import { FocusTr } from "../_common";
import { errorTerms, EVENT_KIND, EVENT_STATUS, type EventsProjection, STAGE_TERM, stageEventId, tracks } from "./model";

function ErrorText({ e }: { e: { code: string; recovery: string } | null | undefined }) {
  const t = useT();
  const k = errorTerms(e);
  return k ? <span className="secondary" data-term={k[0]}>{t(k[0])} ▸ {t(k[1])}</span> : null;
}

/** Two tracks, never merged: scenario events (F03, Ω_A changes) and pipeline stage events (K-35). */
export function DualTrackList({ e }: { e: EventsProjection }) {
  const t = useT();
  const { scenario, pipeline } = tracks(e);
  return (
    <div className="grid-2">
      <div className="panel" data-track="scenario"><h2 className="section-title">{t("ui.track")}: {t("ui.track.scenario")}</h2>
        {scenario.length ? <table className="data"><tbody>{scenario.map((x) => (
          <FocusTr key={x.seq} id={x.event_ref} data-event={x.event_ref}><td className="mono-value"><FocusMarks id={x.event_ref} />{t("ui.tick", { t: x.tick })}</td>
            <td><FocusHandle id={x.event_ref}><IdText>{x.event_ref}</IdText></FocusHandle> <span className="secondary">{t(EVENT_KIND[x.kind])}</span></td>
            <td><RuleDiamond sem={EVENT_STATUS[x.status].sem} term={EVENT_STATUS[x.status].term} /></td>
            <td>{x.effects.map((c) => <span key={c.attribute_ref} className="row"><IdText>{c.attribute_ref}</IdText>
              <DeltaMark before={c.before ?? "—"} after={c.after ?? "—"} space="A" /></span>)}
              <ErrorText e={x.error} /></td></FocusTr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
      <div className="panel" data-track="pipeline"><h2 className="section-title">{t("ui.track")}: {t("ui.track.pipeline")}</h2>
        {pipeline.length ? <table className="data"><tbody>{pipeline.map((s) => (
          <FocusTr key={s.seq} id={stageEventId(s)} data-stage={s.stage}><td className="mono-value"><FocusMarks id={stageEventId(s)} />{s.tick === null || s.tick === undefined ? "—" : t("ui.tick", { t: s.tick })}</td>
            <td><FocusHandle id={stageEventId(s)}>{t(STAGE_TERM[s.stage])}</FocusHandle></td><td><ExecPill status={s.status} /></td>
            <td><ErrorText e={s.error} /></td></FocusTr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
    </div>
  );
}
