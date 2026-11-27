import { useT } from "../language";
import mark from "./assets/emblem-full.png";

/** Product wordmark, visibly large in zone A (G03.10), with the brand mark (DEC-01, decorative: alt is empty and the
 *  image is hidden from assistive technology — the name carries the identity). The environment line is the tooltip. */
export function Wordmark() {
  const t = useT();
  return (
    <span className="brand" title={t("product.env")}>
      <img className="brand-mark" src={mark} alt="" aria-hidden="true" width={36} height={36} />
      <span className="wordmark" data-term="product.name">{t("product.name")}</span>
    </span>
  );
}
