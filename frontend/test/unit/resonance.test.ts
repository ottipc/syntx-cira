// V3T06 / V2T20 (architecture v2.0.3, 04.4): every view's resonance resolver against real projection snapshots.
// The oracle below reads the documented relation field directly from the raw JSON (independent of the resolvers):
// every resonant id must be linked to the focused id by that field (grounding), the focused id is never resonant,
// results are deterministic, and where the snapshot contains a relation the resolver finds it (non-vacuity).
import { describe, expect, it } from "vitest";
import * as v02 from "../../src/views/02-topology/model";
import { b, resonanceCases } from "../helpers/resonanceCases";
import { snapshot } from "../helpers/snapshots";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
const X = (p: string) => `/experiments/${b}${p}`;
const cases = resonanceCases;

describe("[V3T06][V2T20] resonance resolvers against projection snapshots", () => {
  it.each(cases().map((c) => [c.view, c] as const))("view %s: resonance ⊆ documented relation, deterministic, never the focus", (_v, c) => {
    expect(c.ids.length).toBeGreaterThan(0);
    let found = 0;
    for (const f of c.ids) {
      const r = c.resolve(f);
      expect(c.resolve(f), `deterministic for ${f}`).toEqual(r);
      expect(r, `focus ${f} is never its own resonance`).not.toContain(f);
      for (const x of r) expect(c.linked(f, x), `${x} is linked to ${f} by the documented field`).toBe(true);
      found += r.filter((x) => c.ids.includes(x)).length;
    }
    if (c.nonEmpty) expect(found, "the snapshot contains relations; the resolver finds them").toBeGreaterThan(0);
  });

  it("view 02: node:n08 resonates with exactly its 1-hop neighbours and connecting relations", () => {
    const tp = snapshot<J>(X("/topology")).topology;
    const want = tp.relations.filter((r: J) => r.source === "node:n08" || r.target === "node:n08")
      .flatMap((r: J) => [r.relation_id, r.source === "node:n08" ? r.target : r.source]);
    expect([...v02.resolveResonance("node:n08", v02.resonanceVM(tp))].sort()).toEqual([...new Set(want)].sort());
  });

  it("every focusable id is a StableId (K-01), so it survives the URL", () => {
    const STABLE_ID = /^[a-z]+:[a-z0-9][a-z0-9_.:/\-]{0,190}$/;
    for (const c of cases()) for (const id of c.ids) expect(STABLE_ID.test(id), `${c.view}: ${id}`).toBe(true);
  });

  it("unknown focus ids resolve to nothing in every view (absent target → no resonance)", () => {
    for (const c of cases()) expect(c.resolve("x:not-in-projection"), c.view).toEqual([]);
  });
});
