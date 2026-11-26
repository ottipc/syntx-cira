import { useT, type TermKey } from "../../language";
import { type AggregationKey, useSession } from "../../session";

const AGG: readonly [AggregationKey, TermKey][] = [["POOLED", "agg.pooled"], ["PER_TICK", "agg.per_tick"], ["TIME_MEAN_EXPLICIT", "agg.time_mean"]];

export function AggregationBar({ lastTick }: { lastTick: number }) {
  const t = useT();
  const { session, go } = useSession();
  const cur = session.aggregation ?? "POOLED";
  return (
    <div className="toolbar" role="radiogroup" aria-label={t("agg.label")}>
      <span className="secondary">{t("agg.label")}:</span>
      {AGG.map(([k, term]) => (
        <button key={k} type="button" className="chip" aria-pressed={cur === k} data-term={term}
          onClick={() => go({ aggregation: k, toTick: k === "PER_TICK" ? null : session.toTick })}>{t(term)}</button>))}
      {cur !== "PER_TICK" ? <span className="mono-value" data-term="agg.up_to">{t("agg.up_to", { t: session.toTick ?? lastTick })}</span> : null}
    </div>
  );
}
