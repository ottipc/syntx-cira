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
