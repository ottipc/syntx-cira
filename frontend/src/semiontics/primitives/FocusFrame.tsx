import { gridRow } from "./_util";

/** SEM-034 focus field geometry for row-shaped items (architecture v2.0.3, 04.2, D07): a 2-px ink.primary frame around the
 *  row's grid area with corner reticles. The SEM-034 sign itself stays on the row's id (FocusRing); this frame is its
 *  geometry and is hidden from assistive technology. It never restyles a cell. */
export function FocusFrame({ rowIndex }: { rowIndex: number }) {
  return <span className="row-frame row-frame-focused" aria-hidden="true" data-row={String(gridRow(rowIndex))} />;
}
