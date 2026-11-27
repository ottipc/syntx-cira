// Motion orchestration N07 (architecture v2.0.3, 03.7, 05.6.2): the motion phase of a block is subordinate to the
// render transaction. It never commits data and never delays it — it only tells CSS which one-shot state motion may run.
// This module imports nothing from views, contracts, access or session (G03.3).
import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { MOTION } from "../generated/tokens";

export type MotionPhase = "idle" | "entering" | "settled" | "suspended";
export type BlockState = "LOADING" | "READY" | "VIEW_DATA_UNAVAILABLE";
export type MotionEvent = "commit" | "end" | "loading" | "unavailable";

/** The phase machine of 05.6.2 as a pure function. Edges not listed keep the phase. */
export function motionPhase(p: MotionPhase, e: MotionEvent, reduced: boolean): MotionPhase {
  if (e === "unavailable") return "suspended";
  if (e === "loading") return p === "entering" || p === "settled" || p === "suspended" ? "idle" : p;
  if (e === "commit") return p === "idle" ? (reduced ? "settled" : "entering") : p;
  return p === "entering" ? "settled" : p; // end
}

const query = "(prefers-reduced-motion: reduce)";
/** Reduced-motion preference of the environment (M4); false where the environment cannot tell (jsdom). */
export function useReducedMotion(): boolean {
  const mm = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
  const [r, setR] = useState(() => mm?.matches ?? false);
  useEffect(() => {
    if (!mm?.addEventListener) return undefined;
    const on = (e: MediaQueryListEvent) => setR(e.matches);
    mm.addEventListener("change", on);
    return () => mm.removeEventListener("change", on);
  }, [mm]);
  return r;
}

const same = (a: readonly unknown[] | null, b: readonly unknown[]) => a !== null && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));

/** Phase of one block from its render-transaction state and its data generation (identity of the verified data). */
export function useMotionPhase(state: BlockState, generation: readonly unknown[]): MotionPhase {
  const reduced = useReducedMotion();
  const seen = useRef<readonly unknown[] | null>(null);
  const [phase, setPhase] = useState<MotionPhase>(() => {
    if (state === "VIEW_DATA_UNAVAILABLE") return "suspended";
    if (state === "READY") { seen.current = generation; return motionPhase("idle", "commit", reduced); }
    return "idle";
  });
  useLayoutEffect(() => {
    if (state === "LOADING") { seen.current = null; setPhase((p) => motionPhase(p, "loading", reduced)); return; }
    if (state === "VIEW_DATA_UNAVAILABLE") { seen.current = null; setPhase((p) => motionPhase(p, "unavailable", reduced)); return; }
    if (!same(seen.current, generation)) { seen.current = generation; setPhase((p) => motionPhase(p, "commit", reduced)); }
  });
  useEffect(() => {
    if (phase !== "entering") return undefined;
    const id = window.setTimeout(() => setPhase((p) => motionPhase(p, "end", reduced)), MOTION.stage);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);
  return phase;
}

/** Non-visual boundary of a block (05.3): sets `data-state` and `data-motion` on the block element. */
export function MotionBoundary({ state, generation, children, ...rest }: { state: BlockState; generation: readonly unknown[]; children: ReactNode }
  & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  const phase = useMotionPhase(state, generation);
  return <div {...rest} data-state={state} data-motion={phase}>{children}</div>;
}
