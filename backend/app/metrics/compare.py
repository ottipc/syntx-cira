"""ComparisonReport and M09 closure_basis state_rules_A_final_tick/v1 (07.5, S-05, K-43)."""

from __future__ import annotations

from collections.abc import Sequence

from ..contracts.common import StateSpace, StrategyRef
from ..contracts.f02 import GovernanceDefinition, RuleKind
from ..contracts.f03 import ActualState, ScenarioDefinition
from ..contracts.f06 import Aggregation, ComparisonReport, EvaluatedRelation, MetricId
from ..governance import Bottom, evaluate_rules
from ..contracts.f02 import EvalReason
from .comparison import ScenarioMeta, default_tau, incompatibility
from .m09 import closure_sets, m09
from .result import make_result
from .views import ClosureView


def meta(s: ScenarioDefinition, topology_version: str, governance_version: str, baseline_id: str | None = None
         ) -> ScenarioMeta:
    return ScenarioMeta(scenario_id=s.scenario_id, variant_kind=s.variant_kind.value,
                        variant_of=baseline_id, fixture_lineage_id=s.fixture_lineage_id,
                        topology_version=topology_version, governance_version=governance_version, tick_count=s.tick_count)


def _keys(gov: GovernanceDefinition, st: ActualState, tau: int) -> tuple[tuple[str, str], ...]:
    vals = {v.attribute_ref: v for v in st.values}
    rules = tuple(r for r in gov.rules if r.kind is RuleKind.STATE)

    def look(a: str) -> str | Bottom:
        v = vals[a]
        return v.value if v.value is not None else Bottom(EvalReason.NOT_APPLICABLE_INPUT)
    evals, _ = evaluate_rules(rules, StateSpace.A, tau, look)
    by = {r.rule_id: r for r in rules}
    return tuple((f"{e.rule_ref}|{','.join(by[e.rule_ref].scope or by[e.rule_ref].applies_to)}", e.result.value)
                 for e in evals)


def compare_experiments(baseline_id: str, recovery_id: str, base: ScenarioMeta, rec: ScenarioMeta,
                        gov_base: GovernanceDefinition, gov_rec: GovernanceDefinition,
                        base_states: Sequence[ActualState], rec_states: Sequence[ActualState], tau: int | None,
                        basis: StrategyRef) -> ComparisonReport:
    reasons = incompatibility(base, rec, tau)
    t = default_tau(base, rec) if tau is None else tau
    key = f"cmp:{baseline_id.split(':', 1)[1]}:{recovery_id.split(':', 1)[1]}:t{t}"
    if reasons:
        return ComparisonReport(comparison_key=key, baseline_experiment_id=baseline_id, recovery_experiment_id=recovery_id,
                                fixture_lineage_id=base.fixture_lineage_id, comparison_tick=max(t, 0), compatible=False,
                                incompatibility=tuple(reasons), basis=basis)
    cv = ClosureView(baseline=_keys(gov_base, base_states[t], t), recovery=_keys(gov_rec, rec_states[t], t))
    sets = closure_sets(cv)
    r = make_result(MetricId.M09, m09(cv), relation=EvaluatedRelation.BASELINE_RECOVERY, aggregation=Aggregation.PER_TICK,
                    reference_space=f"space:rule_key:t{t}", tick=t)
    return ComparisonReport(comparison_key=key, baseline_experiment_id=baseline_id, recovery_experiment_id=recovery_id,
                            fixture_lineage_id=base.fixture_lineage_id, comparison_tick=t, compatible=True,
                            original=tuple(sets["original"]), resolved=tuple(sets["resolved"]),
                            persisting=tuple(sets["persisting"]),
                            unevaluable_in_recovery=tuple(sets["unevaluable_in_recovery"]), new=tuple(sets["new"]),
                            results=(r,), basis=basis)
