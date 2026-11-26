import { useT } from "../../language";
import type { Layout } from "./layout";
import type { NodeVM } from "./model";
import { NodeTriplet } from "./NodeTriplet";
import { RelationEdgePath } from "./RelationEdgePath";

export function TopologyCanvas({ l, nodes, coupling, show, focus }: { l: Layout; nodes: Map<string, NodeVM>; coupling: Map<string, string>;
  show: { a: boolean; o: boolean; r: boolean }; focus: string | null }) {
  const t = useT();
  return (
    <div className="topology">
      <svg viewBox={`0 0 ${l.width} ${l.height}`} role="img" aria-label={t("view.02")} data-layout-width={l.width}>
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="edge" /></marker></defs>
        {l.edges.map((e) => <RelationEdgePath key={e.id} e={e} coupling={coupling.get(e.id) ?? null} />)}
        {l.nodes.map((b) => <NodeTriplet key={b.id} box={b} vm={nodes.get(b.id)} show={show} focused={focus === b.id} />)}
      </svg>
    </div>
  );
}
