import { useT } from "../../language";

export function Legend() {
  const t = useT();
  return (
    <p className="secondary micro">{t("ui.legend")}: ── {t("ui.relation.depends_on")} · ┄ {t("ui.relation.reports_to")} · ●─ {t("ui.relation.provides")} ·
      ○? {t("obs.unknown")} · ▨ {t("obs.outside")} · ┆ {t("dev.mismatch")} · ◰ {t("gap.open")}</p>
  );
}
