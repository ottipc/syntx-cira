// U18 (architecture v2.0.3, 05.2, 05.6.2, 03.7): motion tokens, the subordinate motion phase machine and MotionBoundary.
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EASING, MOTION } from "../../src/semiontics/generated/tokens";
import { MotionBoundary, motionPhase, type MotionPhase, useMotionPhase } from "../../src/semiontics";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("[U18] motion tokens (05.2 M0/M1)", () => {
  it("durations of the harmonic scale; everything touching data ≤ 200 ms and a multiple of 20 ms", () => {
    expect(MOTION).toMatchObject({ 0: 0, hover: 80, focus: 120, scrub: 140, drawer: 160, carry: 160, tick: 180, stage: 200, loading: 100,
      quarantine: 0, network_pulse: 9000, brand_breath: 14000, ambient_drift: 36000, decor_yield: 480 });
    for (const k of ["hover", "focus", "scrub", "drawer", "carry", "tick", "stage"] as const) {
      expect(MOTION[k]).toBeLessThanOrEqual(200);
      expect(MOTION[k] % 20).toBe(0);
    }
  });
  it("easing set settle / exit / linear / sine", () => {
    expect(EASING).toEqual({ settle: "cubic-bezier(0.2, 0.8, 0.2, 1)", exit: "cubic-bezier(0.4, 0, 1, 1)", linear: "linear", sine: "ease-in-out" });
  });
});

describe("[U18] motion phase machine (05.6.2)", () => {
  const T: [MotionPhase, Parameters<typeof motionPhase>[1], boolean, MotionPhase][] = [
    ["idle", "commit", false, "entering"],
    ["idle", "commit", true, "settled"],
    ["entering", "end", false, "settled"],
    ["entering", "loading", false, "idle"],
    ["settled", "loading", false, "idle"],
    ["idle", "unavailable", false, "suspended"],
    ["entering", "unavailable", false, "suspended"],
    ["settled", "unavailable", false, "suspended"],
    ["suspended", "loading", false, "idle"],
    // no other edges: the phase never commits data and never skips the render transaction
    ["suspended", "commit", false, "suspended"],
    ["settled", "commit", false, "settled"],
    ["idle", "end", false, "idle"],
  ];
  it.each(T)("%s --%s (reduced %s)--> %s", (from, ev, reduced, to) => { expect(motionPhase(from, ev, reduced)).toBe(to); });
});

function Probe({ state, gen }: { state: "LOADING" | "READY" | "VIEW_DATA_UNAVAILABLE"; gen: unknown }) {
  const p = useMotionPhase(state, [gen]);
  return <i data-p={p} />;
}

describe("[U18] useMotionPhase / MotionBoundary", () => {
  it("LOADING → READY (new generation) enters, settles after motion.stage; a key change returns to idle; failure suspends", () => {
    vi.useFakeTimers();
    const a = {}, b = {};
    const r = render(<Probe state="LOADING" gen={null} />);
    const p = () => r.container.querySelector("i")!.getAttribute("data-p");
    expect(p()).toBe("idle");
    r.rerender(<Probe state="READY" gen={a} />);
    expect(p()).toBe("entering");
    act(() => { vi.advanceTimersByTime(MOTION.stage); });
    expect(p()).toBe("settled");
    r.rerender(<Probe state="READY" gen={a} />);
    expect(p(), "same generation: no new entry").toBe("settled");
    r.rerender(<Probe state="LOADING" gen={null} />);
    expect(p()).toBe("idle");
    r.rerender(<Probe state="READY" gen={b} />);
    expect(p()).toBe("entering");
    r.rerender(<Probe state="VIEW_DATA_UNAVAILABLE" gen={null} />);
    expect(p()).toBe("suspended");
    act(() => { vi.advanceTimersByTime(MOTION.stage); });
    expect(p(), "a pending settle timer never leaves suspended").toBe("suspended");
  });
  it("reduced motion settles directly", () => {
    const mm = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const orig = window.matchMedia;
    Object.defineProperty(window, "matchMedia", { configurable: true, value: mm });
    const r = render(<Probe state="LOADING" gen={null} />);
    r.rerender(<Probe state="READY" gen={{}} />);
    expect(r.container.querySelector("i")!.getAttribute("data-p")).toBe("settled");
    Object.defineProperty(window, "matchMedia", { configurable: true, value: orig });
  });
  it("MotionBoundary renders data-motion and data-state on its block and nothing else", () => {
    const r = render(<MotionBoundary state="READY" generation={[1]} className="x"><span>c</span></MotionBoundary>);
    const el = r.container.firstElementChild!;
    expect([el.getAttribute("data-state"), el.getAttribute("data-motion"), el.className, el.textContent]).toEqual(["READY", "entering", "x", "c"]);
  });
});
