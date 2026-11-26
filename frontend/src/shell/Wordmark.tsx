import { useT } from "../language";

/** Product wordmark, visibly large in zone A (G03.10). The environment line is the tooltip (G05.4). */
export function Wordmark() {
  const t = useT();
  return <span className="wordmark" title={t("product.env")} data-term="product.name">{t("product.name")}</span>;
}
