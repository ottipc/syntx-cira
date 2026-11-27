import type { ComponentType, ReactNode } from "react";
import { useSession, type ViewKey } from "../session";
import { TickRail } from "../time";
import { ContextBar } from "./ContextBar";
import { ProvenanceDrawer } from "./ProvenanceDrawer";
import { ViewportGuard } from "./ViewportGuard";
import { ViewRail } from "./ViewRail";
import { Workspace } from "./Workspace";

/** Zones A–E (G03.10). Views are injected by the composition root (Shell does not import Views, G03.3). */
export function AppShell({ views, actions, demo }: { views: Readonly<Record<ViewKey, ComponentType>>; actions: ReactNode; demo: ReactNode }) {
  const { session } = useSession();
  return (
    <ViewportGuard>
      <div className="shell" data-mode={session.mode}>
        <ContextBar actions={actions} />
        <ViewRail />
        <Workspace views={views} demo={demo} />
        <ProvenanceDrawer />
        <footer className="zone-d" data-zone="D">{session.view !== "SCENARIO_COMPARISON" ? <TickRail /> : null}</footer>
      </div>
    </ViewportGuard>
  );
}
