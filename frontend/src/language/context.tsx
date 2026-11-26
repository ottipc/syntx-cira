import { createContext, useContext, type ReactNode } from "react";
import { makeT, type Lang, type TFn } from "./t";

const Ctx = createContext<{ lang: Lang; t: TFn }>({ lang: "en", t: makeT("en") });

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={{ lang, t: makeT(lang) }}>{children}</Ctx.Provider>;
}

export function useT(): TFn {
  return useContext(Ctx).t;
}

export function useLang(): Lang {
  return useContext(Ctx).lang;
}
