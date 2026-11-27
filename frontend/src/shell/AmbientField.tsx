// Ambient environment (architecture v2.0.3, 03.4 N04, 04.7, 05.17, 05.18; DEC-02, DEC-04…DEC-08). Decoration only:
// aria-hidden, no data-sem, no pointer events, no input from projections, focus target, tick or values.
//  · position and size come from the stage alone (stageAnchor) — never from content (V3T11);
//  · DOM occupancy decides only the two budgets (0.11 under text-bearing ground, 0.20 on reserve ground) (R10);
//  · the governor suspends motion on hidden tab, modal, quarantine and an exceeded frame budget (05.6.3) (R9);
//  · the environment yields one step while a focus scope is active — CSS reads that one bit (R11, MOT19).
import { useLayoutEffect, useRef, useState } from "react";
import calyx from "./assets/emblem-calyx.png";
import { mesh } from "./NeuralField";
import { DECOR } from "../semiontics/generated/tokens";
import { compositionFit, presentationScale, stageAnchor, stageClass, type Anchor } from "./stageAnchor";

interface Rect { x: number; y: number; w: number; h: number }
const MESH = mesh();
const MW = 1600, MH = 1000;
const PULSES = MESH.edges.filter((_, i) => i % Math.floor(MESH.edges.length / 11) === 0).slice(0, 11);
const OCCUPY = ".zone-c-content section > *, .state-grid, .grid-2, .grid-3, .stack > *, .panel, table, .state-grid > *, .cell, .layer, "
  + ".chip, .metric-card, .quarantine, .barrier, .chain-link.cut, .topology svg, .origin, .exec, h1, h2, p, .row, .toolbar, .view-head, "
  + ".demo-bar, .space-header, .recovery-line";

function occupied(zone: HTMLElement): Rect[] {
  const z = zone.getBoundingClientRect(), pad = DECOR.occupancy_pad, out: Rect[] = [];
  const add = (b: DOMRect) => {
    if (b.width < 1 || b.height < 1) return;
    const x = Math.max(0, b.left - z.left - pad), y = Math.max(0, b.top - z.top - pad);
    const r = Math.min(z.width, b.right - z.left + pad), bt = Math.min(z.height, b.bottom - z.top + pad);
    if (r > x && bt > y) out.push({ x, y, w: r - x, h: bt - y });
  };
  zone.querySelectorAll<HTMLElement>(OCCUPY).forEach((el) => add(el.getBoundingClientRect()));
  const tw = document.createTreeWalker(zone, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const range = document.createRange();
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (n.parentElement?.closest("svg.ambient")) continue; range.selectNodeContents(n); for (const b of range.getClientRects?.() ?? []) add(b); }
  document.querySelectorAll<HTMLElement>(".zone-e:not([hidden]), .control-panel, [role='dialog']").forEach((el) => add(el.getBoundingClientRect()));
  return out;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)] as const;
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/** One scene, drawn at two budgets; mesh lines only on reserve ground (PF-02). */
function Scene({ w, h, a, lines }: { w: number; h: number; a: Anchor; lines: boolean }) {
  const s = Math.max(w / MW, h / MH), ox = (w - MW * s) / 2, oy = (h - MH * s) / 2, { R, cx, cy } = a;
  return (
    <>
      {lines ? <g className="amb-drift"><g transform={`translate(${ox} ${oy}) scale(${s})`}>
        <g className="amb-lines">{MESH.edges.map((e) => <path key={`${e.a}-${e.b}`} d={e.d} />)}</g>
        <g className="amb-pulses">{PULSES.map((e, i) => <path key={i} d={e.d} className={`amb-pulse nf-delay-${i % 6}`} />)}</g>
        <g className="amb-nodes">{MESH.nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.r} />)}</g>
      </g></g> : null}
      <g className="amb-rings">
        <circle cx={cx} cy={cy} r={R} /><circle cx={cx} cy={cy} r={R * 0.914} />
        <path d={arc(cx, cy, R * 1.62, 200, 335)} /><path d={arc(cx, cy, R * 1.62 * 0.914, 200, 335)} />
        <path d={arc(cx, cy, R * 2.3, 215, 300)} />
      </g>
      <image className="amb-emblem" href={calyx} x={cx - R * (267.5 / 245.5)} y={cy - R * (268 / 245.5)} width={R * (535 / 245.5)} height={R * (535 / 245.5)} />
    </>
  );
}

export function AmbientField() {
  const ref = useRef<SVGSVGElement>(null);
  const vig = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<{ w: number; h: number; W0: number } | null>(null);
  const [occ, setOcc] = useState<Rect[]>([]);
  useLayoutEffect(() => {
    const svg = ref.current, zone = svg?.parentElement;
    if (!svg || !zone) return;
    let raf = 0, slow = false;
    const size = () => {
      const shell = zone.closest<HTMLElement>("[data-mode]");
      const presenting = shell?.dataset.mode === "presentation";
      const scale = presenting ? presentationScale(window.innerHeight) : 1;
      const z = zone.getBoundingClientRect();
      const W0 = Math.round(document.documentElement.clientWidth - z.left), w = Math.round(z.width), h = Math.round(z.height);
      const a = stageAnchor(W0, h);
      zone.style.setProperty("--comp-tangent", `${a.tangent}px`);
      zone.style.setProperty("--light-dx", `${a.shadow.dx}px`);
      zone.style.setProperty("--light-dy", `${a.shadow.dy}px`);
      zone.dataset.fit = compositionFit(a, scale);
      zone.dataset.stage = stageClass(h);
      vig.current?.style.setProperty("--amb-cx", `${a.cx}px`);
      vig.current?.style.setProperty("--amb-cy", `${a.cy}px`);
      setStage((s) => (s && s.w === w && s.h === h && s.W0 === W0 ? s : { w, h, W0 }));
    };
    const governor = () => {
      const q = zone.querySelector('[data-state="VIEW_DATA_UNAVAILABLE"], [data-sem="SEM-028"]');
      const modal = document.querySelector("[role='dialog']:not([hidden])");
      zone.dataset.ambient = slow ? "static" : q || modal || document.visibilityState === "hidden" ? "suspended" : "active";
    };
    const measure = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { size(); setOcc(occupied(zone)); governor(); }); };
    // frame budget (05.6.3): p95 over 120 frames > 33.3 ms → static for the rest of the session
    const frames: number[] = []; let last = 0, sampler = 0;
    const sample = (t: number) => { if (last) frames.push(t - last); last = t;
      if (frames.length < 120) { sampler = requestAnimationFrame(sample); return; }
      const sorted = [...frames].sort((p, q) => p - q); if (sorted[Math.floor(sorted.length * 0.95)]! > 33.3) { slow = true; governor(); } };
    size();
    // without layout observers (jsdom) the scene stays at its first measurement: nothing to follow, nothing to sample
    if (typeof ResizeObserver === "undefined") return;
    sampler = requestAnimationFrame(sample);
    measure();
    const ro = new ResizeObserver(measure); ro.observe(zone);
    const mo = new MutationObserver((recs) => { if (recs.some((r) => !svg.contains(r.target))) measure(); });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "data-state", "class", "data-mode"] });
    zone.addEventListener("scroll", measure, true);
    document.addEventListener("visibilitychange", measure);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); mo.disconnect(); zone.removeEventListener("scroll", measure, true); document.removeEventListener("visibilitychange", measure);
      window.removeEventListener("resize", measure); cancelAnimationFrame(raf); cancelAnimationFrame(sampler); };
  }, []);
  if (!stage) return <svg ref={ref} className="neural-field ambient" aria-hidden="true" focusable="false" />;
  const { w, h, W0 } = stage, a = stageAnchor(W0, h);
  return (
    <>
      <div ref={vig} className="amb-vignette" aria-hidden="true" />
      <svg ref={ref} className="neural-field ambient" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false"
        data-anchor={`${a.cx},${a.cy},${a.R}`}>
        <defs>
          <mask id="amb-reserve" maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
            <rect width={w} height={h} fill="white" />{occ.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="black" />)}
          </mask>
          <mask id="amb-occupied" maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
            <rect width={w} height={h} fill="black" />{occ.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="white" />)}
          </mask>
          <radialGradient id="amb-light-gradient" gradientUnits="userSpaceOnUse" cx={a.cx} cy={a.cy} r={a.R * DECOR.light_radius}>
            <stop offset="0" className="amb-light-0" /><stop offset="1" className="amb-light-1" />
          </radialGradient>
        </defs>
        <g className="amb-light-breath"><circle className="amb-light" cx={a.cx} cy={a.cy} r={a.R * DECOR.light_radius} fill="url(#amb-light-gradient)" /></g>
        <g className="amb-axes" mask="url(#amb-reserve)">{a.axes.map((x, i) => <line key={i} x1={x} x2={x} y1={0} y2={h} />)}</g>
        <g className="amb-level amb-text" mask="url(#amb-occupied)"><Scene w={w} h={h} a={a} lines={false} /></g>
        <g className="amb-level amb-reserve" mask="url(#amb-reserve)"><Scene w={w} h={h} a={a} lines /></g>
      </svg>
    </>
  );
}
