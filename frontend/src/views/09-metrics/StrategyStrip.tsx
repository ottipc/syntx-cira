import { useT } from "../../language";
import { IdText } from "../../semiontics";

export function StrategyStrip({ strategies }: { strategies: readonly { point: string; variant: string; version: number }[] }) {
  const t = useT();
  return (
    <div className="row wrap"><span className="secondary">{t("ui.strategies")}:</span>
      {strategies.map((s) => <IdText key={s.point}>{`${s.point}=${s.variant}/v${s.version}`}</IdText>)}</div>
  );
}
