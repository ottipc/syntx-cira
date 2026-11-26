import { useEffect } from "react";
import { useT } from "../language";
import { useSession } from "../session";
import { NarrationCard } from "./NarrationCard";
import { demoScript, type DemoConfig } from "./script";

/** Demo bar (G05.2): PageDown/PageUp move to the next/previous step URL. */
export function DemoBar({ config }: { config: DemoConfig | null }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const steps = config ? demoScript(config) : [];
  const step = session.demoStep;
  const idx = step !== null ? steps.findIndex((_, i) => i === step - 1) : -1;
  const cur = idx >= 0 ? steps[idx] : undefined;
  const prev = idx > 0 ? steps[idx - 1] : undefined;
  const next = idx >= 0 ? steps[idx + 1] : steps[0];
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "PageDown" && next) { e.preventDefault(); goUrl(next.url); }
      if (e.key === "PageUp" && prev) { e.preventDefault(); goUrl(prev.url); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [next, prev, goUrl]);
  if (!config) return null;
  return (
    <div className="demo-bar" data-zone="demo">
      {cur ? <NarrationCard step={idx + 1} total={steps.length} narration={cur.narration} /> : <span className="narration secondary">{t("demo")}</span>}
      <button type="button" className="btn" disabled={!prev} onClick={() => prev && goUrl(prev.url)} data-term="action.previous">{t("action.previous")}</button>
      <button type="button" className="btn" disabled={!next} onClick={() => next && goUrl(next.url)} data-term={cur ? "action.next" : "action.resume_demo"}>
        {cur ? t("action.next") : t("action.resume_demo")}</button>
    </div>
  );
}
