// Deterministic graph layout (INV-STR-08, TX33): a pure function of (TopologyProjection, graph tokens).
// No DOM measurement: node width = characters × graph.node.char_width + padding. Nodes and edges sorted by StableId.
// Layout arithmetic is permitted here (pure layout function, ADR-0005); no domain value is computed.
import type { TopologyProjectionBody } from "../../access";
import { GRAPH } from "../../semiontics";

export interface Pt { x: number; y: number }
export interface NodeBox { id: string; label: string; layer: number; x: number; y: number; w: number; h: number;
  labelAt: Pt; slots: { a: Pt; o: Pt; r: Pt }; slotBar: { w: number; h: number }; textOffset: Pt; seamAt: Pt; gapAt: Pt }
export interface EdgePath { id: string; type: string; source: string; target: string; d: string }
export interface Layout { nodes: NodeBox[]; edges: EdgePath[]; width: number; height: number }

export function layout(t: TopologyProjectionBody, g: typeof GRAPH = GRAPH): Layout {
  const nodes = [...t.nodes].sort((a, b) => (a.node_id < b.node_id ? -1 : a.node_id > b.node_id ? 1 : 0));
  const rels = [...t.relations].sort((a, b) => (a.relation_id < b.relation_id ? -1 : a.relation_id > b.relation_id ? 1 : 0));
  const out = new Map<string, string[]>();
  for (const r of rels) out.set(r.source, [...(out.get(r.source) ?? []), r.target]);
  const depth = new Map<string, number>();
  const visit = (id: string, stack: Set<string>): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    if (stack.has(id)) return 0;
    stack.add(id);
    let d = 0;
    for (const tgt of out.get(id) ?? []) d = Math.max(d, visit(tgt, stack) + 1);
    stack.delete(id);
    depth.set(id, d);
    return d;
  };
  for (const n of nodes) visit(n.node_id, new Set());
  const width = (n: { node_id: string; label: string }) =>
    Math.max(g.node_min_width, Math.ceil(Math.max(n.node_id.length, n.label.length, 26) * g.node_char_width + 2 * g.node_padding));
  const layers = new Map<number, typeof nodes>();
  for (const n of nodes) layers.set(depth.get(n.node_id) ?? 0, [...(layers.get(depth.get(n.node_id) ?? 0) ?? []), n]);
  const layerKeys = [...layers.keys()].sort((a, b) => a - b);
  const colW = Math.max(...nodes.map(width), g.node_min_width);
  const boxes: NodeBox[] = [];
  for (const L of layerKeys) {
    (layers.get(L) ?? []).forEach((n, i) => {
      const third = colW / 3;
      const p = g.node_padding;
      boxes.push({ id: n.node_id, label: n.label, layer: L, x: L * (colW + g.layer_gap) + p,
                   y: i * (g.node_height + g.node_gap) + p, w: colW, h: g.node_height,
                   labelAt: { x: p / 1.5, y: p + 4 }, slots: { a: { x: 4, y: 26 }, o: { x: third + 4, y: 26 }, r: { x: 2 * third + 4, y: 26 } },
                   slotBar: { w: 4, h: g.node_height - 36 }, textOffset: { x: 8, y: 18 }, seamAt: { x: colW - 14, y: p + 4 },
                   gapAt: { x: colW - 34, y: p + 4 } });
    });
  }
  const pos = new Map(boxes.map((b) => [b.id, b] as const));
  const edges: EdgePath[] = rels.flatMap((r) => {
    const s = pos.get(r.source);
    const d = pos.get(r.target);
    if (!s || !d) return [];
    const x1 = s.x;
    const y1 = s.y + s.h / 2;
    const x2 = d.x + d.w;
    const y2 = d.y + d.h / 2;
    const mx = (x1 + x2) / 2;
    return [{ id: r.relation_id, type: r.relation_type, source: r.source, target: r.target,
              d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)}, ${mx.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}` }];
  });
  const W = Math.max(...boxes.map((b) => b.x + b.w), 0) + g.node_padding;
  const H = Math.max(...boxes.map((b) => b.y + b.h), 0) + g.node_padding;
  return { nodes: boxes, edges, width: W, height: H };
}
