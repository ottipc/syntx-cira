// View 06 ViewModel: target-guided run with target assessment.
import type { BlockInverseResult } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
import type { SemId } from "../../semiontics";

export const ASSESS: Record<string, { sem: SemId; term: TermKey }> = {
  MET: { sem: "SEM-010", term: "target.met" }, NOT_MET: { sem: "SEM-011", term: "target.not_met" }, UNDETERMINED: { sem: "SEM-007", term: "target.undetermined" } };

export function inverseOf(b: BlockInverseResult | null) {
  return b?.availability === "AVAILABLE" && b.content ? { run: b.content.sweep, out: b.content.output, ta: b.content.target_assessment, origin: b.origin ?? "SYNTHETIC" } : null;
}
