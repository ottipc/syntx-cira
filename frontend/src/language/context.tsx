import { createContext, useContext, useEffect, type ReactNode } from "react";
import { makeT, type Lang, type TFn } from "./t";

const Ctx = createContext<{ lang: Lang; t: TFn }>({ lang: "en", t: makeT("en") });

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  // the document language follows the active catalog (WCAG 3.1.1): screen readers pronounce DE text as German
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return <Ctx.Provider value={{ lang, t: makeT(lang) }}>{children}</Ctx.Provider>;
}

export function useT(): TFn {
  return useContext(Ctx).t;
}

export function useLang(): Lang {
  return useContext(Ctx).lang;
}
