import { useT, type TermKey } from "../../language";
import { useSession } from "../../session";

const F: readonly [string | null, TermKey][] = [[null, "ui.filter.all"], ["changed", "ui.filter.changed"], ["open", "ui.filter.open"], ["differs", "ui.filter.differs"]];

export function Filters() {
  const t = useT();
  const { session, go } = useSession();
  return (
    <div className="toolbar" role="group" aria-label={t("ui.filter")}>
      <span className="secondary">{t("ui.filter")}:</span>
      {F.map(([k, term]) => (
        <button key={term} type="button" className="chip" aria-pressed={session.filter === k} onClick={() => go({ filter: k })} data-term={term}>{t(term)}</button>
      ))}
    </div>
  );
}
