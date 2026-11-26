import { useT, type TermKey } from "../language";

/** SEM-033: narration card with step counter — never over data values, never modal. */
export function NarrationCard({ step, total, narration }: { step: number; total: number; narration: TermKey }) {
  const t = useT();
  return (
    <div className="narration" data-sem="SEM-033" data-term={narration}>
      <span className="micro secondary">{t("ui.demo_step", { n: step, m: total })}</span>{" "}
      <span>{t(narration)}</span>{step === 1 ? <span className="secondary"> · {t("product.env")} · {t("msg.fixture_note")}</span> : null}
    </div>
  );
}
