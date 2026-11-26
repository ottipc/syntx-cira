import type { ComponentType } from "react";
import { ep, useProjection } from "../access";
import type { ExperimentsResponse } from "../access";
import { useT } from "../language";
import { ExecPill, IdText, OriginBadge } from "../semiontics";
import { sessionUrl, useSession, type ViewKey } from "../session";

/** Zone C: the active view module, or the experiment selection (no twelfth view, G05.2). */
export function Workspace({ views }: { views: Readonly<Record<ViewKey, ComponentType>> }) {
  const { session } = useSession();
  const V = views[session.view];
  return (
    <main className={`zone-c${session.mode === "presentation" ? " presentation-frame" : ""}`} data-zone="C"
      {...(session.mode === "presentation" ? { "data-sem": "SEM-036", "data-term": "mode.presentation.frame" } : {})}>
      {session.experimentId === null ? <ExperimentSelect /> : <V />}
    </main>
  );
}

function ExperimentSelect() {
  const t = useT();
  const { session, goUrl } = useSession();
  const q = useProjection<ExperimentsResponse>(ep.experiments());
  return (
    <section>
      <h1 className="view-title">{t("msg.select_experiment")}</h1>
      <p className="secondary">{t("product.env")}</p>
      {q.data ? (
        <table className="data"><tbody>
          {q.data.experiments.map((x) => {
            const href = sessionUrl({ ...session, experimentId: x.experiment_id, view: "SYSTEM_FIELD_OVERVIEW", tick: 0 });
            return (
              <tr key={x.experiment_id}>
                <td><a href={href} onClick={(e) => { e.preventDefault(); goUrl(href); }}>{x.label}</a></td>
                <td><IdText>{x.experiment_id}</IdText></td><td><IdText>{x.scenario_id}</IdText></td>
                <td><ExecPill status={x.status} /></td><td><OriginBadge origin={x.data_origin} /></td>
              </tr>);
          })}
        </tbody></table>
      ) : <p className="muted">{t("msg.loading")}</p>}
    </section>
  );
}
