import { useT } from "../../language";
import { TERM_ExecutionStatus } from "../../language/generated/terms";
import { semAttrs } from "./_util";

const GLYPH: Record<string, string> = { CREATED: "○", RUNNING: "◌", COMPLETED: "●", PARTIAL: "◑", FAILED: "✕", BLOCKED: "⊝" };

/** SEM-032: execution status — level 1 only, never in cells (GK-05). */
export function ExecPill({ status }: { status: string }) {
  const t = useT();
  const term = (TERM_ExecutionStatus as Record<string, Parameters<typeof t>[0]>)[status] ?? "exec.created";
  return (
    <span className={`exec exec-${status.toLowerCase()}`} {...semAttrs("SEM-032", term)}>
      <span aria-hidden="true">{GLYPH[status] ?? "○"}</span> {t(term)}
    </span>
  );
}
