// Register lookups for test oracles: expected SEM from bound contract states (sem-cases.json, generated from the SSOT).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Bind { enum?: string; values?: string[]; flag?: string }
export interface Case { primitive: string; views: number[]; binds: Bind[] }
export const CASES: Record<string, Case> = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "generated", "sem-cases.json"), "utf-8"));

/** The unique SEM that binds enum=value for the given primitive (throws if 0 or > 1: TX22 would fail too). */
export function semFor(primitive: string, e: string, value: string): string {
  const hits = Object.entries(CASES).filter(([, c]) => (primitive === "*" || c.primitive === primitive) && c.binds.some((b) => b.enum === e && (b.values ?? []).includes(value)));
  if (hits.length !== 1) throw new Error(`${primitive} ${e}=${value}: ${hits.length} SEM`);
  return hits[0]![0];
}
export function semForFlag(primitive: string, flag: string): string {
  const hits = Object.entries(CASES).filter(([, c]) => c.primitive === primitive && c.binds.some((b) => b.flag === flag));
  if (hits.length !== 1) throw new Error(`${primitive} flag ${flag}: ${hits.length} SEM`);
  return hits[0]![0];
}
export const ORIGIN_SEM = (origin: string) => semFor("OriginBadge", "DataOrigin", origin);
/** SEM ids that may appear in view n according to the register (plus shell/global signs). */
export function allowedIn(view: number): Set<string> {
  return new Set(Object.entries(CASES).filter(([, c]) => c.views.includes(view)).map(([id]) => id));
}
