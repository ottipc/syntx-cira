// View 05 — Forward reconstruction (G04.4). SEM-003, 013–016, 018, 027, 029; endpoints #6 (forward), #14.
import { ep, useProjection } from "../../access";
import type { ResultsProjection, TraceProjection } from "../../access";
import { useT } from "../../language";
import { SpaceCell } from "../../semiontics";
import { sessionUrl, useSession } from "../../session";
import { Guarded, ProvButton } from "../_common";
import { OutputTabs, RunHeader, TraceTimeline } from "../_common/RunParts";
import { forwardOf } from "./model";

export function ForwardView() {
  const t = useT();
  const { session, goUrl } = useSession();
  const rs = useProjection<ResultsProjection>(ep.results(session, "forward"));
  const tr = useProjection<TraceProjection>(ep.trace(session, "fwd"));
  return (
    <section aria-labelledby="v05">
      <Guarded v={rs}>{(r) => {
        const f = forwardOf(r.forward);
        if (!f) return <><h1 id="v05" className="view-title">{t("view.05")}</h1><SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: session.tick }} /></>;
        const href = sessionUrl({ ...session, view: "ARCHITECTURAL_CLOSURE_INSPECTOR" });
        return (
          <div className="stack">
            <RunHeader run={f.run} origin={f.origin} title="view.05"><span>· {t("run.no_target")}</span></RunHeader>
            <div className="grid-2">
              <Guarded v={tr}>{(x) => <TraceTimeline tr={x} />}</Guarded>
              <div className="stack"><OutputTabs out={f.out} />
                <a href={href} onClick={(e) => { e.preventDefault(); goUrl(href); }}>▸ {t("ui.compare_hint")}</a></div>
            </div>
            <ProvButton title="run.forward" header={r.header} raw={r.forward} />
          </div>
        );
      }}</Guarded>
    </section>
  );
}
export default ForwardView;
