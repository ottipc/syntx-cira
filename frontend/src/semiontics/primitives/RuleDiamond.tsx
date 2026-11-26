import { useT, type TermKey } from "../../language";
import { SEM, type SemId } from "../generated/sem";
import { semAttrs } from "./_util";

/** SEM-010–012: rule truth / match verdict — never execution status (GK-05). */
export function RuleDiamond({ sem, term, reason, count }: { sem: SemId; term: TermKey; reason?: TermKey | null; count?: number }) {
  const t = useT();
  return (
    <span className={`diamond ${sem.toLowerCase()}`} {...semAttrs(sem, term)}>
      <span aria-hidden="true" className="diamond-glyph">{SEM[sem].glyph}</span>
      {count !== undefined ? <span className="mono-value">{String(count)}</span> : <span>{t(term)}</span>}
      {reason ? <span className="reason"> · {t(reason)}</span> : null}
    </span>
  );
}
