import { useT } from "../../language";
import { OriginBadge } from "../../semiontics";

export function OverlayToolbar({ show, set, origins }: { show: { a: boolean; o: boolean; r: boolean };
  set: (k: "a" | "o" | "r") => void; origins: { a: string | null; o: string | null; r: string | null } }) {
  const t = useT();
  const items: ["a" | "o" | "r", "space.a.short" | "space.o.short" | "space.r.short"][] = [["a", "space.a.short"], ["o", "space.o.short"], ["r", "space.r.short"]];
  return (
    <div className="toolbar"><span className="secondary">{t("ui.show")}:</span>
      {items.map(([k, term]) => (
        <span key={k} className="row"><button type="button" className="chip" aria-pressed={show[k]} onClick={() => set(k)} data-term={term}>{t(term)}</button>
          {origins[k] ? <OriginBadge origin={origins[k] ?? "SYNTHETIC"} /> : null}</span>
      ))}
    </div>
  );
}
