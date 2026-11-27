import { useFocusHandle, useFocusItem } from "../../semiontics";
import type { EdgePath } from "./layout";

/** Topology relation (achromatic, by type) with optional coupling status overlay (SEM-037, GK-04). */
export function RelationEdgePath({ e, coupling }: { e: EdgePath; coupling: string | null }) {
  const f = useFocusItem(e.id);
  const h = useFocusHandle(e.id);
  return (
    <g data-relation={e.id} {...f.attrs} {...h} aria-label={e.id}>
      <path className={`edge edge-${e.type}`} d={e.d} markerEnd="url(#arrow)" />
      {coupling ? <path className={`edge edge-${coupling.toLowerCase()}`} d={e.d} data-sem="SEM-037" data-coupling={coupling} /> : null}
    </g>
  );
}
