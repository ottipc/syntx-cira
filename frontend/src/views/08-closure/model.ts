// View 08 ViewModel: four quadrants — closure (rule results Ω_R), disagreements (merge conflicts),
// gaps (open/closed), recovery (proposals, authorization records). Selection only.
export type { GovernanceProjection, ResultsProjection, ExperimentViewResponse } from "../../contracts/generated/cira";
import type { Decision2, EvalReason, GovernanceProjection, RuleEvaluation, RuleResult } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
import type { SemId } from "../../semiontics";

export const RESULT: Record<RuleResult, { sem: SemId; term: TermKey }> = {
  TRUE: { sem: "SEM-010", term: "rule.true" }, FALSE: { sem: "SEM-011", term: "rule.false" }, UNEVALUABLE: { sem: "SEM-012", term: "rule.unevaluable" } };
export const REASON: Record<EvalReason, TermKey> = {
  OK: "rule.reason.ok", UNKNOWN_INPUT: "rule.reason.unknown_input", UNDETERMINED_INPUT: "rule.reason.undetermined_input",
  NOT_APPLICABLE_INPUT: "rule.reason.na_input", REQUIREMENT_NOT_MET: "rule.reason.requirement" };
export const DECISION: Record<Decision2, TermKey> = { APPROVED: "authority.approved", REJECTED: "authority.rejected" };

export function evaluations(g: GovernanceProjection): RuleEvaluation[] {
  return [...(g.evaluations.content?.evaluations ?? [])].sort((a, b) => (a.rule_ref < b.rule_ref ? -1 : 1));
}

/** View 08 resonance (04.4): proposal `subject_refs`, gap `subject_refs`, conflict `attribute_ref` (as present in P).
 *  A proposal resonates with the gaps it affects (shared subject id); a gap with its proposals and conflicts; a conflict
 *  with the gaps whose subjects contain its attribute. Equality on ids only (TX26). */
export interface ResonanceVM08 {
  proposals: readonly { id: string; subjects: readonly string[] }[];
  gaps: readonly { id: string; subjects: readonly string[] }[];
  conflicts: readonly string[];
}
export function resonanceVM(proposals: readonly { proposal_id: string; subject_refs: readonly string[] }[],
                            gaps: readonly { gap_id: string; subject_refs: readonly string[] }[], conflicts: readonly { attribute_ref: string }[]): ResonanceVM08 {
  return { proposals: proposals.map((p) => ({ id: p.proposal_id, subjects: p.subject_refs })),
    gaps: gaps.map((g) => ({ id: g.gap_id, subjects: g.subject_refs })), conflicts: conflicts.map((c) => c.attribute_ref) };
}
export function resolveResonance(focus: string, vm: ResonanceVM08): readonly string[] {
  const shares = (a: readonly string[], b: readonly string[]) => a.some((x) => b.includes(x));
  const p = vm.proposals.find((x) => x.id === focus);
  const g = vm.gaps.find((x) => x.id === focus);
  const out = p ? vm.gaps.filter((x) => shares(x.subjects, p.subjects)).map((x) => x.id)
    : g ? [...vm.proposals.filter((x) => shares(x.subjects, g.subjects)).map((x) => x.id), ...vm.conflicts.filter((c) => g.subjects.includes(c))]
    : vm.conflicts.includes(focus) ? vm.gaps.filter((x) => x.subjects.includes(focus)).map((x) => x.id) : [];
  return [...new Set(out)];
}
