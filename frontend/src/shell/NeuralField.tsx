// DEC-02 neural field (register "Decoration"): a fixed node mesh behind zone C. It carries no statement — generated from
// a constant seed, independent of every projection, aria-hidden, no data-sem; opacity ≤ opacity.network.max so text over
// it keeps ≥ 4.5 : 1 (TX23). Pulses use motion.network.pulse, which is 0 under reduced motion.
const W = 1600;
const H = 1000;
const NODES = 64;
const NEIGHBOURS = 3;
const PULSES = 11;

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Mesh { nodes: { x: number; y: number; r: number }[]; edges: { a: number; b: number; d: string }[] }

/** Pure and deterministic (same picture on every load and in every visual baseline). */
export function mesh(seed = 0xc12a): Mesh {
  const r = rng(seed);
  const nodes = Array.from({ length: NODES }, () => ({ x: Math.round(r() * W), y: Math.round(r() * H), r: 1.2 + Math.round(r() * 2) }));
  const seen = new Set<string>();
  const edges: Mesh["edges"] = [];
  nodes.forEach((n, i) => {
    const near = nodes.map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 })).filter((x) => x.j !== i)
      .sort((p, q) => p.d - q.d || p.j - q.j).slice(0, NEIGHBOURS);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const m = nodes[j]!;
      edges.push({ a: i, b: j, d: `M${n.x} ${n.y}L${m.x} ${m.y}` });
    }
  });
  return { nodes, edges };
}

const MESH = mesh();
const PULSE_EDGES = MESH.edges.filter((_, i) => i % Math.floor(MESH.edges.length / PULSES) === 0).slice(0, PULSES);

export function NeuralField() {
  return (
    <svg className="neural-field" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {/* one group, one opacity: overlapping lines, nodes and pulses never exceed opacity.network.max */}
      <g className="nf-all">
        <g className="nf-lines">{MESH.edges.map((e) => <path key={`${e.a}-${e.b}`} d={e.d} />)}</g>
        <g className="nf-pulses">{PULSE_EDGES.map((e, i) => <path key={`p${e.a}-${e.b}`} d={e.d} className={`nf-pulse nf-delay-${i % 6}`} />)}</g>
        <g className="nf-nodes">{MESH.nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.r} />)}</g>
      </g>
    </svg>
  );
}
