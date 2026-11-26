import { useT, type TermKey } from "../language";
import { useSession, VIEW_IDS, sessionUrl, type ViewKey } from "../session";

export const VIEW_TERM: Record<ViewKey, TermKey> = {
  SYSTEM_FIELD_OVERVIEW: "view.01", TOPOLOGY_GRAPH: "view.02", TEMPORAL_STATE_EXPLORER: "view.03", OBSERVATION_INSPECTOR: "view.04",
  FORWARD_SWEEP_INSPECTOR: "view.05", INVERSE_SWEEP_INSPECTOR: "view.06", STRUCTURAL_GAP_INSPECTOR: "view.07",
  ARCHITECTURAL_CLOSURE_INSPECTOR: "view.08", STRUCTURAL_METRICS: "view.09", SCENARIO_COMPARISON: "view.10", EVENT_TIMELINE: "view.11",
};
const NUM: Record<ViewKey, string> = {
  SYSTEM_FIELD_OVERVIEW: "01", TOPOLOGY_GRAPH: "02", TEMPORAL_STATE_EXPLORER: "03", OBSERVATION_INSPECTOR: "04",
  FORWARD_SWEEP_INSPECTOR: "05", INVERSE_SWEEP_INSPECTOR: "06", STRUCTURAL_GAP_INSPECTOR: "07", ARCHITECTURAL_CLOSURE_INSPECTOR: "08",
  STRUCTURAL_METRICS: "09", SCENARIO_COMPARISON: "10", EVENT_TIMELINE: "11",
};

export function ViewRail() {
  const t = useT();
  const { session, goUrl } = useSession();
  return (
    <nav className="zone-b" aria-label={t("layer.f07")} data-zone="B">
      <ul className="rail">
        {VIEW_IDS.map((v) => {
          const href = sessionUrl({ ...session, view: v });
          return (
            <li key={v}>
              <a href={href} aria-current={session.view === v ? "page" : undefined} data-term={VIEW_TERM[v]}
                onClick={(e) => { e.preventDefault(); goUrl(href); }}>
                <span className="num">{NUM[v]}</span><span>{t(VIEW_TERM[v])}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
