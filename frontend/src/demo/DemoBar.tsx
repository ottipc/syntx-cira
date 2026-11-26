import { useEffect, useState } from "react";
import { useT } from "../language";
import { useSession } from "../session";
import { NarrationCard } from "./NarrationCard";
import { demoScript, SECONDS_PER_STEP, type DemoConfig } from "./script";

/** Demo bar (G05.2): PageDown/PageUp move to the next/previous step URL. "Play demo" walks through all steps by
 *  itself (SECONDS_PER_STEP each) so a presenter can record hands-free; it only navigates (INV-FUN-07, no POST).
 *  Any manual navigation, Escape or "Stop" ends the playback. */
export function DemoBar({ config }: { config: DemoConfig | null }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const [playing, setPlaying] = useState(false);
  const steps = config ? demoScript(config) : [];
  const step = session.demoStep;
  const idx = step !== null ? steps.findIndex((_, i) => i === step - 1) : -1;
  const cur = idx >= 0 ? steps[idx] : undefined;
  const prev = idx > 0 ? steps[idx - 1] : undefined;
  const next = idx >= 0 ? steps[idx + 1] : steps[0];
  const manual = (url: string) => { setPlaying(false); goUrl(url); };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "PageDown" && next) { e.preventDefault(); manual(next.url); }
      if (e.key === "PageUp" && prev) { e.preventDefault(); manual(prev.url); }
      if (e.key === "Escape" && playing) setPlaying(false);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (next) goUrl(next.url);
      else setPlaying(false);
    }, SECONDS_PER_STEP * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!config) return null;
  const start = () => { const first = steps[0]; if (first) { goUrl(first.url); setPlaying(true); } };
  return (
    <div className="demo-bar" data-zone="demo" data-playing={playing ? "true" : "false"}>
      {cur ? <NarrationCard step={idx + 1} total={steps.length} narration={cur.narration} /> : <span className="narration secondary">{t("demo")}</span>}
      {playing ? (
        <button type="button" className="btn" onClick={() => setPlaying(false)} data-term="action.stop_demo">{t("action.stop_demo")}</button>
      ) : (
        <>
          <button type="button" className="btn" onClick={start} data-term="action.play_demo">
            ▶ {t("action.play_demo", { s: steps.length * SECONDS_PER_STEP })}</button>
          <button type="button" className="btn" disabled={!prev} onClick={() => prev && manual(prev.url)} data-term="action.previous">{t("action.previous")}</button>
          <button type="button" className="btn" disabled={!next} onClick={() => next && manual(next.url)} data-term={cur ? "action.next" : "action.resume_demo"}>
            {cur ? t("action.next") : t("action.resume_demo")}</button>
        </>
      )}
    </div>
  );
}
