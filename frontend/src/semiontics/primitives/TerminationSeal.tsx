import { useT } from "../../language";
import { TERM_TerminationReason } from "../../language/generated/terms";
import { semAttrs } from "./_util";

/** SEM-029: documented termination (T12). */
export function TerminationSeal({ reason, steps }: { reason: string; steps: number }) {
  const t = useT();
  const term = (TERM_TerminationReason as Record<string, Parameters<typeof t>[0]>)[reason] ?? "term.error";
  return (
    <span className="seal" {...semAttrs("SEM-029", term)}>
      <span aria-hidden="true">▣</span> {t(term)} · {t("run.steps", { n: steps })}
    </span>
  );
}
