import type { ReactNode } from "react";
import { ep, useProjection } from "../access";
import type { ExperimentViewResponse } from "../access";
import { LanguageSwitch, useT } from "../language";
import { ExecPill, IdText, OriginBadge } from "../semiontics";
import { useSession } from "../session";
import { Wordmark } from "./Wordmark";

/** Zone A: wordmark, experiment, execution status, origin, tick, actions (G03.4). */
export function ContextBar({ actions }: { actions: ReactNode }) {
  const t = useT();
  const { session, go } = useSession();
  const v = useProjection<ExperimentViewResponse>(session.experimentId ? ep.experiment(session) : null);
  const x = v.data?.experiment;
  return (
    <header className="zone-a" data-zone="A">
      <Wordmark />
      <div className="ctx-exp">
        {x ? (<>
          <span>{x.label}</span><IdText>{x.experiment_id}</IdText>
          <ExecPill status={x.status} />
          <OriginBadge origin={x.data_origin} />
          <span className="mono-value" data-term="ui.tick_of">{t("ui.tick_of", { t: session.tick, n: x.ticks.last })}</span>
        </>) : <span className="secondary">{t("product.tagline")}</span>}
      </div>
      <span className="spacer" />
      <button type="button" className="chip" aria-pressed={session.mode === "presentation"} data-term="ui.mode.presentation"
        onClick={() => go({ mode: session.mode === "presentation" ? "standard" : "presentation" })}>{t("ui.mode.presentation")}</button>
      <LanguageSwitch onChange={(lang) => go({ lang })} />
      {actions}
    </header>
  );
}
