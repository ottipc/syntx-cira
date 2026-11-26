import { useT } from "../../language";
import { RuleDiamond } from "../../semiontics";
import type { RibbonVM } from "./model";

/** Counts come from RuleEvaluationSet.summary (K-64), not from a client-side count. */
export function RuleRibbon({ r }: { r: RibbonVM }) {
  const t = useT();
  if (!r.available) return <span className="muted">{t("avail.none", { t: "—" })}</span>;
  return (
    <span className="row" data-ribbon={r.space}>
      <RuleDiamond sem="SEM-010" term="rule.true" count={r.t} />
      <RuleDiamond sem="SEM-011" term="rule.false" count={r.f} />
      <RuleDiamond sem="SEM-012" term="rule.unevaluable" count={r.u} />
    </span>
  );
}
