// View 02 ViewModel: per-node triplet (Ω_A, Ω_O, Ω_R) without mixing; δ and gaps from the server.
import type { BlockReconstructionResult, MetricsProjection, ObservationProjection, StateProjection } from "../../contracts/generated/cira";
import type { SemId } from "../../semiontics";

export interface Slot { sem: SemId; value: string | null }
export interface NodeVM { a: Slot | null; o: Slot | null; r: Slot | null; outside: boolean; differs: boolean; gaps: number }

const nodeOfAttr = (a: string) => `node:${a.slice(5).split("/")[0] ?? ""}`;

export function nodeStates(st: StateProjection | null, ob: ObservationProjection | null, rec: BlockReconstructionResult | null,
                           mt: MetricsProjection | null): Map<string, NodeVM> {
  const m = new Map<string, NodeVM>();
  const get = (n: string) => m.get(n) ?? { a: null, o: null, r: null, outside: false, differs: false, gaps: 0 };
  for (const v of st?.values ?? []) {
    const n = nodeOfAttr(v.attribute_ref);
    m.set(n, { ...get(n), a: v.applicability === "NOT_APPLICABLE" ? { sem: "SEM-008", value: null } : { sem: "SEM-001", value: v.value ?? null } });
  }
  const vis = new Set(ob?.observation.content?.visible_nodes ?? []);
  for (const p of ob?.observation.content?.projected ?? []) {
    const n = nodeOfAttr(p.attribute_ref);
    const outside = ob !== null && !vis.has(n);
    const slot: Slot = outside ? { sem: "SEM-031", value: null } : p.status === "KNOWN" ? { sem: p.stale ? "SEM-005" : "SEM-004", value: p.value ?? null }
      : p.status === "NOT_APPLICABLE" ? { sem: "SEM-008", value: null } : { sem: "SEM-006", value: null };
    m.set(n, { ...get(n), o: slot, outside });
  }
  if (rec?.availability === "AVAILABLE" && rec.content) {
    const vals = new Map(rec.content.output.values.map((v) => [v.attribute_ref, v] as const));
    for (const [n] of m) {
      const v = [...vals.values()].find((x) => nodeOfAttr(x.attribute_ref) === n);
      m.set(n, { ...get(n), r: v && v.status === "DETERMINED" ? { sem: "SEM-003", value: v.value ?? null } : { sem: "SEM-007", value: null } });
    }
    for (const g of rec.content.output.gaps) {
      for (const s of g.subject_refs) {
        const n = s.startsWith("attr:") ? nodeOfAttr(s) : s;
        if (m.has(n)) m.set(n, { ...get(n), gaps: get(n).gaps === 0 ? g.source_refs.length : get(n).gaps });
      }
    }
  } else {
    for (const [n] of m) m.set(n, { ...get(n), r: { sem: "SEM-009", value: null } });
  }
  for (const a of mt?.report.attribute_membership ?? []) {
    if (a.delta === 1) m.set(nodeOfAttr(a.attribute_ref), { ...get(nodeOfAttr(a.attribute_ref)), differs: true });
  }
  return m;
}

export function couplings(rec: BlockReconstructionResult | null): Map<string, string> {
  return new Map((rec?.content?.output.relations ?? []).map((r) => [r.relation_key, r.coupling_status] as const));
}
