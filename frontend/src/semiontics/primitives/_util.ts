import { SEM, type SemId } from "../generated/sem";

export function semAttrs(id: SemId, term?: string): Record<string, string> {
  const a: Record<string, string> = { "data-sem": id, "data-sem-name": SEM[id].name };
  if (term) a["data-term"] = term;
  return a;
}

export function lookup<K extends string>(table: Readonly<Record<K, SemId>>, key: string): SemId | null {
  return (table as Readonly<Record<string, SemId>>)[key] ?? null;
}
