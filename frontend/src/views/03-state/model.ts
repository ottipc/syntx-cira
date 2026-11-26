// View 03 ViewModel (G04.4): reorders and selects; computes nothing (TX26). δ comes from the server (K-63).
import type { ActualValue, AttributeMembership, BlockReconstructionResult, ObservationProjection, ProjectedValue,
  ReconstructedValue, RuleEvaluationSet, StateProjection } from "../../contracts/generated/cira";
import type { TermKey, TParams } from "../../language";
import type { SemId } from "../../semiontics";

export interface CellVM { sem: SemId; value: string | null; term: TermKey | null; params?: TParams; epi: string | null;
  source: string | null; delta: { before: string; after: string } | null }
export interface RowVM { attribute: string; a: CellVM; o: CellVM | null; r: CellVM | null; differs: boolean; changed: boolean; open: boolean }
export interface RibbonVM { space: "A" | "O" | "R"; available: boolean; t: number; f: number; u: number }

const cell = (sem: SemId, value: string | null, term: TermKey | null, extra: Partial<CellVM> = {}): CellVM =>
  ({ sem, value, term, epi: null, source: null, delta: null, ...extra });

export function aCell(v: ActualValue, delta: { before: string; after: string } | null): CellVM {
  if (v.applicability === "NOT_APPLICABLE") return cell("SEM-008", null, "app.na");
  return cell("SEM-001", v.value ?? null, null, { delta });
}

export function oCell(p: ProjectedValue | undefined, visible: boolean, delta: { before: string; after: string } | null): CellVM {
  if (!visible) return cell("SEM-031", null, "obs.outside");
  if (!p || p.status === "UNKNOWN") return cell("SEM-006", null, "obs.unknown");
  if (p.status === "NOT_APPLICABLE") return cell("SEM-008", null, "app.na");
  if (p.stale) return cell("SEM-005", p.value ?? null, "obs.known.stale", { params: { k: String(p.observed_at_tick ?? "") }, source: p.source_id ?? null, delta });
  return cell("SEM-004", p.value ?? null, null, { source: p.source_id ?? null, delta });
}

export function rCell(v: ReconstructedValue | undefined): CellVM {
  if (!v || v.status === "UNDETERMINED") return cell("SEM-007", null, "rec.undetermined", { epi: v?.epistemic_class ?? null });
  if (v.status === "NOT_APPLICABLE") return cell("SEM-008", null, "app.na");
  return cell("SEM-003", v.value ?? null, null, { epi: v.epistemic_class ?? null });
}

export function buildRows(st: StateProjection, ob: ObservationProjection | null, rec: BlockReconstructionResult | null,
                          membership: readonly AttributeMembership[], filter: string | null): RowVM[] {
  const obs = ob?.observation.content ?? null;
  const projected = new Map((obs?.projected ?? []).map((p) => [p.attribute_ref, p] as const));
  const visibleNodes = new Set(obs?.visible_nodes ?? []);
  const nodeOf = new Map(st.values.map((v) => [v.attribute_ref, `node:${v.attribute_ref.slice(5).split("/")[0] ?? ""}`] as const));
  const dA = new Map((st.delta?.changes ?? []).map((c) => [c.attribute_ref, { before: c.before.value ?? "—", after: c.after.value ?? "—" }] as const));
  const dO = new Map((obs?.delta?.changes ?? []).map((c) => [c.attribute_ref, { before: c.before.value ?? c.before.status, after: c.after.value ?? c.after.status }] as const));
  const recAvailable = rec?.availability === "AVAILABLE";
  const values = new Map((rec?.content?.output.values ?? []).map((v) => [v.attribute_ref, v] as const));
  const devs = new Set(membership.filter((m) => m.delta === 1).map((m) => m.attribute_ref));
  const rows = st.values.map((v): RowVM => {
    const o = ob ? oCell(projected.get(v.attribute_ref), visibleNodes.has(nodeOf.get(v.attribute_ref) ?? ""), dO.get(v.attribute_ref) ?? null) : null;
    const r = recAvailable ? rCell(values.get(v.attribute_ref)) : null;
    return { attribute: v.attribute_ref, a: aCell(v, dA.get(v.attribute_ref) ?? null), o, r, differs: devs.has(v.attribute_ref),
             changed: dA.has(v.attribute_ref) || dO.has(v.attribute_ref),
             open: o?.sem === "SEM-006" || o?.sem === "SEM-031" || r?.sem === "SEM-007" };
  });
  if (filter === "changed") return rows.filter((x) => x.changed);
  if (filter === "open") return rows.filter((x) => x.open);
  if (filter === "differs") return rows.filter((x) => x.differs);
  return rows;
}

export function ribbon(space: "A" | "O" | "R", set: RuleEvaluationSet | null): RibbonVM {
  if (!set) return { space, available: false, t: 0, f: 0, u: 0 };
  return { space, available: true, t: set.summary.true, f: set.summary.false, u: set.summary.unevaluable };
}
