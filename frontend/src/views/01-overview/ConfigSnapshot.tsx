import type { ConfigurationSnapshot } from "../../access";
import { useT } from "../../language";
import { IdText } from "../../semiontics";

export function ConfigSnapshot({ c }: { c: ConfigurationSnapshot | null | undefined }) {
  const t = useT();
  if (!c) return null;
  return (
    <div className="panel">
      <h2 className="section-title">{t("ui.configuration")}</h2>
      <div className="row"><span className="secondary">{t("ui.scenario")}</span><IdText>{c.scenario_id}</IdText></div>
      <div className="row"><span className="secondary">{t("ui.observation_setup")}</span><IdText>{c.observation_config_id}</IdText></div>
      <div className="row"><span className="secondary">{t("ui.target")}</span><IdText>{c.target_id}</IdText></div>
      <div className="row"><span className="secondary">{t("ui.adapter")}</span><IdText>{c.adapter_kind}</IdText>
        <span className="secondary">{t("ui.schedule")}</span><IdText>{c.sweep_schedule}</IdText></div>
      <div className="row"><span className="secondary">{t("prov.strategies")}</span>
        {c.strategies.map((s) => <IdText key={s.point}>{`${s.variant}/v${s.version}`}</IdText>)}</div>
    </div>
  );
}
