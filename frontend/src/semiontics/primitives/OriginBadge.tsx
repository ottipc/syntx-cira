import { useT } from "../../language";
import { TERM_DataOrigin } from "../../language/generated/terms";
import { SEM_DataOrigin } from "../generated/sem";
import { lookup, semAttrs } from "./_util";

/** SEM-013–017: achromatic origin capsule (GK-01). FIXTURE carries the stripe signet + "TEST FIXTURE". */
export function OriginBadge({ origin }: { origin: string }) {
  const t = useT();
  const sem = lookup(SEM_DataOrigin, origin) ?? "SEM-014";
  const term = (TERM_DataOrigin as Record<string, Parameters<typeof t>[0]>)[origin] ?? "origin.synthetic";
  const cls = `origin origin-${origin.toLowerCase()}`;
  return (
    <span className={cls} {...semAttrs(sem, term)} title={t(term)} role="note" aria-label={t(term)}>
      {origin === "FIXTURE" ? <span className="origin-signet">{t("origin.fixture.signet")}</span> : <span>{t(term)}</span>}
    </span>
  );
}
