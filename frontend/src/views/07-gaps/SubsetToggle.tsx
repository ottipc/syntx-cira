import { useT } from "../../language";
import { useSession } from "../../session";

export function SubsetToggle() {
  const t = useT();
  const { session, go } = useSession();
  const obs = session.filter === "observable";
  return (
    <div className="toolbar" role="radiogroup" aria-label={t("ui.filter")}>
      <button type="button" className="chip" aria-pressed={!obs} onClick={() => go({ filter: null })} data-term="match.subset.all">{t("match.subset.all")}</button>
      <button type="button" className="chip" aria-pressed={obs} onClick={() => go({ filter: "observable" })} data-term="match.subset.observable">{t("match.subset.observable")}</button>
    </div>
  );
}
