import { useT } from "../../language";
import { semAttrs } from "./_util";

export interface TickSpan { from_tick: number; to_tick?: number | null }

/** SEM-030: source activity across ticks 0..last with exact gaps (layout arithmetic lives here, not in views). */
export function ContinuityBand({ first, last, gaps, lastTick, continuity }: { first: number; last: number; gaps: readonly TickSpan[]; lastTick: number; continuity: string }) {
  const t = useT();
  const term = continuity === "CONTINUOUS" ? "obs.continuous" : "obs.interrupted";
  const flags: boolean[] = [];
  for (let k = 0; k <= lastTick; k += 1) {
    const inGap = gaps.some((g) => k >= g.from_tick && k <= (g.to_tick ?? k));
    flags.push(k >= first && k <= last && !inGap);
  }
  return (
    <span className="band" {...semAttrs("SEM-030", term)}>
      <span className="band-cells" aria-hidden="true">{flags.map((a, i) => <span key={i} className={a ? "band-on" : "band-off"} />)}</span>
      <span>{t(term)}</span>
    </span>
  );
}
