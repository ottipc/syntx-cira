import { useT } from "../../language";
import { RationalBar } from "./RationalBar";
import { type Rat, semAttrs } from "./_util";

export type { Rat };
const rat = (r: Rat) => (r.d === 1 ? String(r.n) : `(${r.n}/${r.d})`);

/** SEM-021: exact fraction + decimal (formatting only) + target. Never without n/d, never an overall index. */
/** Number first (D09): the fraction is the anchor on its own line; decimal and target share one subordinate line; the
 *  optional RationalBar sits beneath. */
export function RationalMetric({ numerator, denominator, value, target, bar = true }: { numerator: Rat; denominator: Rat; value: number; target: Rat | null;
  bar?: boolean }) {
  const t = useT();
  const fraction = `${rat(numerator)}/${rat(denominator)}`;
  return (
    <span className="metric-value" {...semAttrs("SEM-021", "metric.value")}>
      <span className="mono-value fraction">{fraction}</span>
      <span className="metric-sub"><span className="mono-value decimal">{` = ${value.toFixed(3)}`}</span>
        {target ? <span className="target"> · {t("metric.target", { v: rat(target) })}</span> : null}</span>
      {bar ? <RationalBar value={value} fraction={fraction} target={target} /> : null}
    </span>
  );
}
