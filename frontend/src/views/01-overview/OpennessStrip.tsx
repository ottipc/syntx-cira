import type { ContentOpenness } from "../../access";
import { useT } from "../../language";
import { OPENNESS } from "./model";

/** Open information, separate from execution status (K-35). */
export function OpennessStrip({ o, tick }: { o: ContentOpenness; tick: number }) {
  const t = useT();
  return (
    <div className="panel">
      <h2 className="section-title">{t("openness")} ({t("ui.tick", { t: tick })})</h2>
      <table className="data"><tbody>
        {OPENNESS.map(([k, term]) => <tr key={k}><td>{t(term)}</td><td className="mono-value">{String(o[k] ?? 0)}</td></tr>)}
      </tbody></table>
    </div>
  );
}
