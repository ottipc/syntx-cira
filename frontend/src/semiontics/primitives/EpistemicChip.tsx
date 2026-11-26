import { useT } from "../../language";
import { TERM_EpistemicClass } from "../../language/generated/terms";
import { semAttrs } from "./_util";

/** SEM-018: knowledge class of an Ω_R statement. */
export function EpistemicChip({ cls }: { cls: string }) {
  const t = useT();
  const term = (TERM_EpistemicClass as Record<string, Parameters<typeof t>[0]>)[cls] ?? "epi.open_ref";
  return <span className={`chip epi epi-${cls.toLowerCase()}`} {...semAttrs("SEM-018", term)}>{t(term)}</span>;
}
