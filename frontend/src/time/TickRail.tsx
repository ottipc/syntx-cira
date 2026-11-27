import { useEffect, useLayoutEffect, useRef } from "react";
import { ep, useInvalidateOnProgress, useProjection } from "../access";
import type { ExperimentViewResponse } from "../access";
import { useT } from "../language";
import { useSession } from "../session";
import { neighbours, tickRange } from "./ticks";

/** Zone D (architecture v2.0.3, 03.8 N08): tick rail — nodes t0…tN on one track, a neutral luminous ring on the active
 *  tick (ink.primary, never space.actual), reconstruction marks ◆ from `sweeps[].up_to_tick`, ←/→ keys, run selector.
 *  The ring has no state of its own: its position is Q.tick; it moves by transform (MOT17). Data stay gated by the
 *  render transaction of every timed block (05.6.1); the rail never interpolates between ticks. */
export function TickRail() {
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowLeft" && prev !== null) go({ tick: prev });
      if (e.key === "ArrowRight" && next !== null) go({ tick: next });
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [prev, next, go]);
  // ring geometry from the active node's box (layout only); written as custom properties, never as inline style attributes
  const track = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const node = track.current?.querySelector<HTMLElement>(`[data-tick="${session.tick}"]`);
    if (!node || !ring.current) { ring.current?.removeAttribute("data-placed"); return; }
    ring.current.style.setProperty("--ring-x", `${node.offsetLeft}px`);
    ring.current.style.setProperty("--ring-w", `${node.offsetWidth}px`);
    ring.current.setAttribute("data-placed", "");
  }, [session.tick, ticks.length, sweepTicks.join()]);
  if (!x) return <div className="scrubber tick-rail" />;
  return (
    <div className="scrubber tick-rail" role="group" aria-label={t("ui.tick", { t: session.tick })}>
      <button type="button" className="btn" disabled={prev === null} onClick={() => prev !== null && go({ tick: prev })}
        aria-label={t("action.previous")}>◀</button>
      <div className="tick-track" ref={track}>
        <span className="tick-ring" ref={ring} aria-hidden="true" />
        {ticks.map((k) => (
          <button key={k} type="button" className="tick-btn" aria-current={k === session.tick ? "true" : undefined}
            onClick={() => go({ tick: k })} data-tick={k}>
            {`t${k}`}{sweepTicks.includes(k) ? <span className="sweep-mark" title={t("ui.reconstruction_step")}> ◆</span> : null}
          </button>
        ))}
      </div>
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
