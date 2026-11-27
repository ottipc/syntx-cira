import { useEffect, useRef } from "react";
import { useT } from "../../language";
import { sessionUrl, useSession } from "../../session";
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
  const { session, goUrl } = useSession();
  const { scenario, pipeline } = tracks(e);
  // RES-08 / MOT17: rows of Q.tick form the active tick group (neutral band, same Q.tick as the Zone D ring); on a tick
  // change the group is brought into view (instant). Nothing here advances time.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { root.current?.querySelector("[data-active-tick]")?.scrollIntoView?.({ block: "nearest", behavior: "instant" }); }, [session.tick]);
  const active = (tick: number | null | undefined) => (tick === session.tick ? { "data-active-tick": "" } : {});
  const to03 = (a: string) => sessionUrl({ ...session, view: "TEMPORAL_STATE_EXPLORER", focus: a });
  return (
    <div className="grid-2 timeline-ground" ref={root}>
      <div className="panel" data-track="scenario"><h2 className="section-title">{t("ui.track")}: {t("ui.track.scenario")}</h2>
        {scenario.length ? <table className="data"><tbody>{scenario.map((x) => (
          <FocusTr key={x.seq} id={x.event_ref} data-event={x.event_ref} {...active(x.tick)}><td className="mono-value"><FocusMarks id={x.event_ref} />{t("ui.tick", { t: x.tick })}</td>
            <td><FocusHandle id={x.event_ref}><IdText>{x.event_ref}</IdText></FocusHandle> <span className="secondary">{t(EVENT_KIND[x.kind])}</span></td>
            <td><RuleDiamond sem={EVENT_STATUS[x.status].sem} term={EVENT_STATUS[x.status].term} /></td>
            <td>{x.effects.map((c) => <span key={c.attribute_ref} className="row">
              <a href={to03(c.attribute_ref)} className="subject-link" onClick={(ev) => { ev.preventDefault(); goUrl(to03(c.attribute_ref)); }}><IdText>{c.attribute_ref}</IdText></a>
              <DeltaMark before={c.before ?? "—"} after={c.after ?? "—"} space="A" /></span>)}
              <ErrorText e={x.error} /></td></FocusTr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
      <div className="panel" data-track="pipeline"><h2 className="section-title">{t("ui.track")}: {t("ui.track.pipeline")}</h2>
        {pipeline.length ? <table className="data"><tbody>{pipeline.map((s) => (
          <FocusTr key={s.seq} id={stageEventId(s)} data-stage={s.stage} {...active(s.tick)}><td className="mono-value"><FocusMarks id={stageEventId(s)} />{s.tick === null || s.tick === undefined ? "—" : t("ui.tick", { t: s.tick })}</td>
            <td><FocusHandle id={stageEventId(s)}>{t(STAGE_TERM[s.stage])}</FocusHandle></td><td><ExecPill status={s.status} /></td>
            <td><ErrorText e={s.error} /></td></FocusTr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
    </div>
  );
}
