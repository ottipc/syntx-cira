import { useT } from "../../language";
import { DeltaMark, ExecPill, IdText, RuleDiamond } from "../../semiontics";
import { EVENT_KIND, EVENT_STATUS, type EventsProjection, STAGE_TERM, tracks } from "./model";

/** Two tracks, never merged: scenario events (F03, Ω_A changes) and pipeline stage events (K-35). */
export function DualTrackList({ e }: { e: EventsProjection }) {
  const t = useT();
  const { scenario, pipeline } = tracks(e);
  return (
    <div className="grid-2">
      <div className="panel" data-track="scenario"><h2 className="section-title">{t("ui.track")}: {t("ui.track.scenario")}</h2>
        {scenario.length ? <table className="data"><tbody>{scenario.map((x) => (
          <tr key={x.seq} data-event={x.event_ref}><td className="mono-value">{t("ui.tick", { t: x.tick })}</td>
            <td><IdText>{x.event_ref}</IdText> <span className="secondary">{t(EVENT_KIND[x.kind])}</span></td>
            <td><RuleDiamond sem={EVENT_STATUS[x.status].sem} term={EVENT_STATUS[x.status].term} /></td>
            <td>{x.effects.map((c) => <span key={c.attribute_ref} className="row"><IdText>{c.attribute_ref}</IdText>
              <DeltaMark before={c.before ?? "—"} after={c.after ?? "—"} space="A" /></span>)}
              {x.error ? <span className="secondary">{x.error.message}</span> : null}</td></tr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
      <div className="panel" data-track="pipeline"><h2 className="section-title">{t("ui.track")}: {t("ui.track.pipeline")}</h2>
        {pipeline.length ? <table className="data"><tbody>{pipeline.map((s) => (
          <tr key={s.seq} data-stage={s.stage}><td className="mono-value">{s.tick === null || s.tick === undefined ? "—" : t("ui.tick", { t: s.tick })}</td>
            <td>{t(STAGE_TERM[s.stage])}</td><td><ExecPill status={s.status} /></td>
            <td>{s.error ? <span className="secondary">{s.error.message}</span> : null}</td></tr>))}</tbody></table>
          : <p className="secondary">{t("msg.no_data")}</p>}
      </div>
    </div>
  );
}
