import { useT } from "../../language";
import { gridRow, semAttrs } from "./_util";

/** SEM-038 "Linked to selection" (architecture v2.0.3, 04.4): the canonical frame — solid 1.5 px ink.secondary whose inner
 *  edge lies 3 px outside the host. Drawn as its own element over the host's area, never as a style of the host, so an
 *  absence carrier inside the host is never restyled. `shape="svg"` returns an inflated rectangle for SVG hosts. */
export function ResonanceMark({ shape = "box", w = 0, h = 0, hostStroke = 1, rowIndex }: { shape?: "box" | "svg"; w?: number; h?: number; hostStroke?: number;
  /** 0-based index of a row-shaped host below one header row (CSS places the frame with attr(data-row)) */ rowIndex?: number }) {
  const row = rowIndex === undefined ? undefined : gridRow(rowIndex);
  const t = useT();
  const attrs = { ...semAttrs("SEM-038", "focus.linked"), "aria-label": t("focus.linked") };
  if (shape === "svg") {
    const k = 3 + 0.75 + hostStroke / 2;
    return <rect className="resonance" x={-k} y={-k} width={w + 2 * k} height={h + 2 * k} {...attrs} />;
  }
  return <span className={`resonance-frame${row ? " row-frame row-frame-resonant" : ""}`} aria-hidden="true" {...(row ? { "data-row": String(row) } : {})}
    {...semAttrs("SEM-038", "focus.linked")} />;
}
