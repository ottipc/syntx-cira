// Inspection matrix (08.5): 11 views × 3 viewports × {EN, DE} × {standard, presentation} = 132 settled states.
import { VIEW_IDS } from "../../src/session";

export const VIEWPORTS = [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1280, height: 720 }] as const;
export const LANGS = ["en", "de"] as const;
export const MODES = ["standard", "presentation"] as const;
export interface Case { view: string; width: number; height: number; lang: string; mode: string; name: string }
export const MATRIX: Case[] = VIEW_IDS.flatMap((view) => VIEWPORTS.flatMap((vp) => LANGS.flatMap((lang) => MODES.map((mode) => ({
  view, ...vp, lang, mode, name: `${view}__${vp.width}x${vp.height}__${lang}__${mode}` })))));
