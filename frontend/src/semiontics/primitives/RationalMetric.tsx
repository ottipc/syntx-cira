import { useT } from "../../language";
import { semAttrs } from "./_util";

export interface Rat { n: number; d: number }
const rat = (r: Rat) => (r.d === 1 ? String(r.n) : `(${r.n}/${r.d})`);

/** SEM-021: exact fraction + decimal (formatting only) + target. Never without n/d, never an overall index. */
export function RationalMetric({ numerator, denominator, value, target }: { numerator: Rat; denominator: Rat; value: number; target: Rat | null }) {
  const t = useT();
  return (
    <span className="metric-value" {...semAttrs("SEM-021", "metric.value")}>
      <span className="mono-value fraction">{`${rat(numerator)}/${rat(denominator)}`}</span>
      <span className="mono-value decimal">{` = ${value.toFixed(3)}`}</span>
      {target ? <span className="target"> · {t("metric.target", { v: rat(target) })}</span> : null}
    </span>
  );
}
