// F07.5 Product Language — typed t(): only existing catalogue keys (INV-LANG-02).
import { TERMS, type Lang, type TermKey } from "./generated/terms";

export type { Lang, TermKey } from "./generated/terms";
export type TParams = Readonly<Record<string, string | number>>;
export type TFn = (key: TermKey, params?: TParams) => string;

export function makeT(lang: Lang): TFn {
  return (key, params) => {
    const entry = TERMS[key];
    let s = entry[lang];
    if (params) {
      for (const p of entry.params) {
        const v = params[p];
        if (v !== undefined) s = s.split(`{${p}}`).join(String(v));
      }
    }
    return s;
  };
}
