import { useLayoutEffect, useRef } from "react";
import { useT } from "../../language";
import type { Rat } from "./_util";

/** Optional 0–1 bar beneath an exact metric (architecture v2.0.3, 03.9 N09, 04.9). Pure layout: the server's value enters
 *  CSS as a custom-property string (`--metric-value`), the fill width is `calc(var(--metric-value) * 100%)` — no
 *  arithmetic here. Drawn only for a finite value inside [0, 1]; the target tick only for a target of exactly 0 or 1.
 *  `role="img"` with a catalog label that repeats the exact fraction. */
export function RationalBar({ value, fraction, target }: { value: number; fraction: string; target: Rat | null }) {
  const t = useT();
  const fill = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => { fill.current?.style.setProperty("--metric-value", String(value)); }, [value]);
  if (!Number.isFinite(value) || value < 0 || value > 1) return null;
  const tick = target === null ? null : target.n === 0 ? "start" : target.n === target.d ? "end" : null;
  return (
    <span className="rational-bar" role="img" aria-label={t("metric.bar", { v: fraction })}>
      <span className="bar-fill" ref={fill}><span className="bar-cap" /></span>
      {tick ? <span className={`bar-target bar-target-${tick}`} /> : null}
    </span>
  );
}
