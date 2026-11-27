import { gridRow } from "./_util";

/** SEM-034 focus field geometry (architecture v2.0.3, 04.2, D07): a 2-px ink.primary frame with corner reticles. The
 *  SEM-034 sign itself stays on the item (FocusRing, `data-sem` on the host); this frame is its geometry and is hidden
 *  from assistive technology. It never restyles a cell.
 *  - `rowIndex`: row-shaped host in a grid (view 03); the frame spans the row's grid area via attr(data-row).
 *  - `shape="svg"`: SVG host of size w×h (view 02 nodes); frame and reticles as SVG strokes.
 *  - otherwise: box host (positioned ancestor); the frame lies on the host's outer edge. */
export function FocusFrame({ rowIndex, shape = "box", w = 0, h = 0 }: { rowIndex?: number; shape?: "box" | "svg"; w?: number; h?: number }) {
  if (shape === "svg") {
    // reticle arms 6 px, outer edge 6 px outside the box (04.2); frame stroke 2 px centred on the box edge + 1
    const o = 6, L = 6;
    const corners: [number, number, number, number][] = [[-o, -o, 1, 1], [w + o, -o, -1, 1], [-o, h + o, 1, -1], [w + o, h + o, -1, -1]];
    return (
      <g className="focus-frame-svg" aria-hidden="true">
        <rect x={-1} y={-1} width={w + 2} height={h + 2} />
        {corners.map(([x, y, sx, sy]) => <path key={`${x}:${y}`} d={`M ${x} ${y + sy * L} L ${x} ${y} L ${x + sx * L} ${y}`} />)}
      </g>
    );
  }
  if (rowIndex !== undefined) return <span className="row-frame row-frame-focused" aria-hidden="true" data-row={String(gridRow(rowIndex))} />;
  return <span className="focus-frame" aria-hidden="true" />;
}
