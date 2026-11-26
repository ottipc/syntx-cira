import { useT } from "../../language";
import { useSession } from "../../session";
import type { ComparisonsResponse } from "./model";

export function ComparisonSelector({ list }: { list: ComparisonsResponse }) {
  const t = useT();
  const { session, go } = useSession();
  return (
    <label className="row"><span className="secondary">{t("cmp.select")}</span>
      <select value={session.comparisonId ?? ""} onChange={(e) => go({ comparisonId: e.target.value || null })} data-term="cmp.select">
        <option value="">{t("cmp.none")}</option>
        {list.comparisons.map((c) => <option key={c.comparison_id} value={c.comparison_id}>{c.comparison_id}</option>)}
      </select></label>
  );
}
