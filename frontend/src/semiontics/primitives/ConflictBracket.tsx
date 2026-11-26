import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-026: forward ≠ target-guided; resolution text depends on origin (GK-20). */
export function ConflictBracket({ forward, inverse, resolution, origin }: { forward: string | null; inverse: string | null; resolution: string; origin: string }) {
  const t = useT();
  const res = resolution === "ENGINE_RESOLVED" ? (origin === "FIXTURE" ? "merge.engine_resolved.fixture" : "merge.engine_resolved")
    : "merge.undetermined";
  return (
    <span className="conflict" {...semAttrs("SEM-026", "merge.conflict")}>
      <span aria-hidden="true">⟦</span>
      <span className="mono-value">{forward ?? "—"}</span><span> ≠ </span><span className="mono-value">{inverse ?? "—"}</span>
      <span aria-hidden="true">⟧</span> <span className="reason">{t(res)}</span>
    </span>
  );
}
