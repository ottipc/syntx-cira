// Composition root (G03.3): the only module that knows every view. Shell receives views and actions by injection.
import { ep, useProjection } from "./access";
import type { ComparisonsResponse, ExperimentsResponse } from "./access";
import { ControlDrawer, ExportAction } from "./control";
import { DemoBar, type DemoConfig } from "./demo";
import { LanguageProvider } from "./language";
import { ProvenanceProvider } from "./provenance";
import { useSession, type ViewKey } from "./session";
import { AppShell } from "./shell";
import OverviewView from "./views/01-overview/View";
import TopologyView from "./views/02-topology/View";
import StateView from "./views/03-state/View";
import ObservationView from "./views/04-observation/View";
import ForwardView from "./views/05-forward/View";
import InverseView from "./views/06-inverse/View";
import GapsView from "./views/07-gaps/View";
import ClosureView from "./views/08-closure/View";
import MetricsView from "./views/09-metrics/View";
import ComparisonView from "./views/10-comparison/View";
import TimelineView from "./views/11-timeline/View";

export const VIEWS: Readonly<Record<ViewKey, () => React.JSX.Element>> = {
  SYSTEM_FIELD_OVERVIEW: OverviewView, TOPOLOGY_GRAPH: TopologyView, TEMPORAL_STATE_EXPLORER: StateView,
  OBSERVATION_INSPECTOR: ObservationView, FORWARD_SWEEP_INSPECTOR: ForwardView, INVERSE_SWEEP_INSPECTOR: InverseView,
  STRUCTURAL_GAP_INSPECTOR: GapsView, ARCHITECTURAL_CLOSURE_INSPECTOR: ClosureView, STRUCTURAL_METRICS: MetricsView,
  SCENARIO_COMPARISON: ComparisonView, EVENT_TIMELINE: TimelineView,
};

/** Demo configuration from server lists only (first compatible comparison); no invented ids. */
export function demoConfig(x: ExperimentsResponse | null, c: ComparisonsResponse | null): DemoConfig | null {
  const cmp = c?.comparisons.find((e) => e.compatible) ?? null;
  if (cmp) return { baseline: cmp.baseline, recovery: cmp.recovery, comparisonId: cmp.comparison_id };
  const first = x?.experiments[0];
  return first ? { baseline: first.experiment_id, recovery: first.experiment_id, comparisonId: null } : null;
}

function Shell() {
  const { session } = useSession();
  const xs = useProjection<ExperimentsResponse>(ep.experiments());
  const cs = useProjection<ComparisonsResponse>(ep.comparisons({ ...session, experimentId: null }));
  return (
    <LanguageProvider lang={session.lang}>
      <ProvenanceProvider>
        <AppShell views={VIEWS} actions={<><ControlDrawer /><ExportAction /></>}
          demo={<DemoBar config={demoConfig(xs.data, cs.data)} />} />
      </ProvenanceProvider>
    </LanguageProvider>
  );
}

export function App() {
  return <Shell />;
}
export default App;
