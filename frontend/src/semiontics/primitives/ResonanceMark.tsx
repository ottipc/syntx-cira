import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-038 "Linked to selection" (architecture v2.0.3, 04.4): the canonical frame — solid 1.5 px ink.secondary whose inner
 *  edge lies 3 px outside the host. Drawn as its own element over the host's area, never as a style of the host, so an
 *  absence carrier inside the host is never restyled. `shape="svg"` returns an inflated rectangle for SVG hosts. */
export function ResonanceMark({ shape = "box", w = 0, h = 0, hostStroke = 1 }: { shape?: "box" | "svg"; w?: number; h?: number; hostStroke?: number }) {
  const t = useT();
  const attrs = { ...semAttrs("SEM-038", "focus.linked"), "aria-label": t("focus.linked") };
  if (shape === "svg") {
    const k = 3 + 0.75 + hostStroke / 2;
    return <rect className="resonance" x={-k} y={-k} width={w + 2 * k} height={h + 2 * k} {...attrs} />;
  }
  return <span className="resonance-frame" aria-hidden="true" {...semAttrs("SEM-038", "focus.linked")} />;
}
