import { useEffect } from "react";
import { ep, useInvalidateOnProgress, useProjection } from "../access";
import type { ExperimentViewResponse } from "../access";
import { useT } from "../language";
import { useSession } from "../session";
import { neighbours, tickRange } from "./ticks";

/** Zone D: tick scrubber with reconstruction marks (◆) and run selection (G03.4, SEM-009 marks). */
export function TickScrubber() {
  const t = useT();
  const { session, go } = useSession();
  const v = useProjection<ExperimentViewResponse>(session.experimentId ? ep.experiment(session) : null,
    true && session.experimentId !== null);
  const x = v.data?.experiment;
  useInvalidateOnProgress(x ? `${x.status}:${x.stage_status.length}:${x.sweeps.length}` : null);
  const ticks = x ? tickRange(x.ticks.first, x.ticks.last) : [];
  const sweepTicks = x ? x.sweeps.map((s) => s.up_to_tick) : [];
  const attempts = x ? [...new Set(x.sweeps.map((s) => s.attempt))].sort() : [0];
  const { prev, next } = neighbours(ticks, session.tick);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prev !== null) go({ tick: prev });
      if (e.key === "ArrowRight" && next !== null) go({ tick: next });
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [prev, next, go]);
  if (!x) return <div className="scrubber" />;
  return (
    <div className="scrubber" role="group" aria-label={t("ui.tick", { t: session.tick })}>
      <button type="button" className="btn" disabled={prev === null} onClick={() => prev !== null && go({ tick: prev })}
        aria-label={t("action.previous")}>◀</button>
      {ticks.map((k) => (
        <button key={k} type="button" className="tick-btn" aria-current={k === session.tick ? "true" : undefined}
          onClick={() => go({ tick: k })} data-tick={k}>
          {`t${k}`}{sweepTicks.includes(k) ? <span className="sweep-mark" title={t("ui.reconstruction_step")}> ◆</span> : null}
        </button>
      ))}
      <button type="button" className="btn" disabled={next === null} onClick={() => next !== null && go({ tick: next })}
        aria-label={t("action.next")}>▶</button>
      <span className="micro secondary">◆ {t("ui.reconstruction_step")}</span>
      <label className="micro secondary">{t("ui.run")}{" "}
        <select value={session.attempt} onChange={(e) => go({ attempt: Number(e.target.value) })} aria-label={t("ui.run")}>
          {attempts.map((a) => <option key={a} value={a}>{t("run.attempt", { n: a })}</option>)}
        </select>
      </label>
    </div>
  );
}
