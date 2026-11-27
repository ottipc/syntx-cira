// Stage geometry (architecture v2.0.3, 05.17, 05.18): one pure function yields the emblem anchor, the three emblem axes,
// the information boundary and the light's shadow vector. Inputs are the stage only — never content, data, focus or view.
import { COMP, LIGHT } from "../semiontics/generated/tokens";

export interface Anchor { cx: number; cy: number; R: number; boundary: number; tangent: number; axes: readonly [number, number, number];
  shadow: { dx: number; dy: number } }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** W0 = Zone C width with the drawer closed, H = Zone C height (px). */
export function stageAnchor(W0: number, H: number): Anchor {
  const boundary = Math.round(W0 * (1 - COMP.reserve));
  const Wr = W0 - boundary;
  const R = Math.round(clamp(Math.min(COMP.ring_k * Wr, COMP.ring_h * H), COMP.ring_min, COMP.ring_max));
  const cx = Math.round(boundary + Wr / 2), cy = Math.round(H * COMP.anchor_cy);
  const tangent = cx - R;
  // light model: shadows fall from the anchor toward the centre of the information space, plus a constant downward bias
  const dx = tangent / 2 - cx, dy = H / 2 - cy, n = Math.hypot(dx, dy) || 1;
  const shadow = { dx: Math.round((dx / n) * LIGHT.shadow_length * 10) / 10, dy: Math.round(((dy / n) * LIGHT.shadow_length + LIGHT.shadow_bias) * 10) / 10 };
  return { cx, cy, R, boundary, tangent, axes: [cx - R, cx, cx + R], shadow };
}

/** Composition fit (05.17): the reserve column exists only while the widest one-row rhythm still fits at this scale. */
export function compositionFit(a: Anchor, scale: number): "reserve" | "collapsed" {
  return a.tangent - 2 * COMP.gutter >= COMP.min_info * scale ? "reserve" : "collapsed";
}

/** Stage class (05.9): Zone C height below `comp.stage.short` is a short stage. */
export function stageClass(H: number): "short" | "tall" {
  return H < COMP.stage_short ? "short" : "tall";
}

/** Presentation scale law (05.9, OD-14): projected type keeps its size on any projector. */
export function presentationScale(viewportHeight: number, max = 1.25, refHeight = 1080): number {
  return Math.round(clamp(max * viewportHeight / refHeight, 1, max) * 1000) / 1000;
}
