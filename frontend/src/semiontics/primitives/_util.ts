import { SEM, type SemId } from "../generated/sem";

/** Exempt set (architecture v2.0.3, 03.5): always canonical — never attenuated, framed or animated by focus. */
export const EXEMPT: ReadonlySet<SemId> = new Set<SemId>(["SEM-006", "SEM-007", "SEM-008", "SEM-009", "SEM-011", "SEM-012", "SEM-013",
  "SEM-014", "SEM-015", "SEM-016", "SEM-017", "SEM-019", "SEM-020", "SEM-022", "SEM-024", "SEM-028", "SEM-031", "SEM-035"]);
/** Absence carriers (04.5): motionless, on void ground, never restyled by focus. */
export const ABSENCE: ReadonlySet<SemId> = new Set<SemId>(["SEM-006", "SEM-007", "SEM-008", "SEM-009", "SEM-012", "SEM-022", "SEM-024", "SEM-031"]);

export function semAttrs(id: SemId, term?: string): Record<string, string> {
  const a: Record<string, string> = { "data-sem": id, "data-sem-name": SEM[id].name };
  if (EXEMPT.has(id)) a["data-attn"] = "exempt";
  if (term) a["data-term"] = term;
  return a;
}

export function lookup<K extends string>(table: Readonly<Record<K, SemId>>, key: string): SemId | null {
  return (table as Readonly<Record<string, SemId>>)[key] ?? null;
}
