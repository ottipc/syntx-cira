import { useT, useLang } from "./context";
import type { Lang } from "./t";

export function LanguageSwitch({ onChange }: { onChange: (l: Lang) => void }) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="lang-switch" role="group" aria-label={t("ui.language")}>
      {(["en", "de"] as const).map((l) => (
        <button key={l} type="button" className="chip" aria-pressed={lang === l} onClick={() => onChange(l)}
          data-term={`lang.${l}`}>{t(l === "en" ? "lang.en" : "lang.de")}</button>
      ))}
    </div>
  );
}
