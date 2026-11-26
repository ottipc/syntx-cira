"""F06 evaluation: three state spaces → views → M01–M11 → EvaluationReport (Kap. 07, 08.7, K-15, K-19, K-63, K-64).

F06 receives ReferenceState (Ω_A), ObservationRecord + ObservationBundle (Ω_O via ω, K-09), ReconstructionResult (Ω_R),
the governance (evaluator), the annotations and the metric configuration. It computes; it never changes inputs.
"""

from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from fractions import Fraction

from ..contracts.common import (Applicability, ArtifactRef, DataOrigin, ErrorCodeC, ErrorRecord, ExecutionStatus,
                                FieldId, ObservationStatus, RecoveryAction, StateSpace, StrategyRef, make_ref)
from ..contracts.f01 import ImmutableTopology
from ..contracts.f02 import EvalReason, GovernanceDefinition, RuleEvaluationSet, RuleKind
from ..contracts.f03 import ActualState, ConsistencyAnnotationSet, MetricConfig
from ..contracts.f04_public import ObservationBundle
from ..contracts.f04_record import ObservationConfig
from ..contracts.f05 import ReconstructionResult
from ..contracts.f06 import (Aggregation, AttributeMembership, CaseSubset, EvaluatedRelation, EvaluationReport,
                             GapMatch, MetricId, MetricResult, ReferenceSpace, ReferenceSpaceKind, Verdict, WeightSet)
from ..core.hashing import content_hash
from ..governance import Bottom, evaluate_set
from ..strategies import variant_of
from . import aggregation, m01, m02, m03, m04, m05, m06, m07, m08, m10, m11
from .matching import match, normalize
from .result import make_result, rational
from .ticksets import consecutive_pairs
from .views import (AttrState, CaseView, FunctionSeries, GapView, NumDen, RuleTickView, StabilityView, TickView,
                    Weights)

REPORT_VERSION = "1.0.2"


@dataclass
class EvaluationInputs:
    topology: ImmutableTopology
    governance: GovernanceDefinition
    weight_set: WeightSet
    config: ObservationConfig
    metric_config: MetricConfig
    states: Sequence[ActualState]
    bundles: Mapping[int, ObservationBundle]
    reconstructions: Mapping[tuple[int, int], ReconstructionResult]
    sweep_ticks: Sequence[int]
    stability_tick: int | None
    service_functions: Sequence[str]
    annotations: ConsistencyAnnotationSet | None = None
    input_refs: Sequence[ArtifactRef] = ()
    data_origin: DataOrigin = DataOrigin.FIXTURE
    extra_errors: Sequence[ErrorRecord] = field(default_factory=tuple)


@dataclass(frozen=True)
class EvaluationOutput:
    report: EvaluationReport
    rule_sets: tuple[RuleEvaluationSet, ...]


def weights_of(ws: WeightSet) -> Weights:
    return Weights(default=Fraction(ws.default_weight.n, ws.default_weight.d),
                   explicit=tuple(sorted((w.attribute_ref, Fraction(w.weight.n, w.weight.d)) for w in ws.weights)))


def omega_f06(bundle: ObservationBundle | None, t: int, universe: Sequence[str],
              decl: Mapping[str, Applicability]) -> dict[str, tuple[str, str | None, bool]]:
    """ω(i,t) per K-09 on the bundle context t: (status, value, stale)."""
    ctx = next((c for c in bundle.contexts if c.tick == t), None) if bundle else None
    best: dict[str, tuple[int, str, str | None]] = {}
    for o in (ctx.observations if ctx else ()):
        if o.status is ObservationStatus.KNOWN:
            k = (-o.observed_at_tick, o.source_id or "")
            cur = best.get(o.attribute_ref)
            if cur is None or (k < (cur[0], cur[1])):
                best[o.attribute_ref] = (-o.observed_at_tick, o.source_id or "", o.value)
    out: dict[str, tuple[str, str | None, bool]] = {}
    for a in universe:
        if decl.get(a) is Applicability.NOT_APPLICABLE:
            out[a] = ("NOT_APPLICABLE", None, False)
        elif a in best:
            out[a] = ("KNOWN", best[a][2], -best[a][0] < t)
        else:
            out[a] = ("UNKNOWN", None, False)
    return out


class Evaluator:
    def __init__(self, inp: EvaluationInputs) -> None:
        self.i = inp
        self.universe = list(inp.topology.attribute_universe)
        self.decl = {a.attribute_id: a.applicability for n in inp.topology.definition.nodes for a in n.attributes}
        self.w = weights_of(inp.weight_set)
        self.policy = variant_of(inp.metric_config.hypothesis_policy)
        self.gov_ref = make_ref("governance_definition", inp.governance)
        self.applies = {r.rule_id: r.applies_to for r in inp.governance.rules}
        self.results: list[MetricResult] = []
        self.errors: list[ErrorRecord] = list(inp.extra_errors)
        self.spaces: dict[str, ReferenceSpace] = {}
        self.rule_sets: list[RuleEvaluationSet] = []
        self.ticks = [s.tick for s in inp.states]

    # ---- spaces ------------------------------------------------------------------------------------------
    def space(self, kind: ReferenceSpaceKind, tick: int | None, members: Sequence[str], suffix: str = "") -> str:
        sid = f"space:{kind.value.lower()}:{'pooled' if tick is None else 't' + str(tick)}{suffix}".lower()
        if sid not in self.spaces:
            body = {"kind": kind.value, "tick": tick, "members": list(members),
                    "weights": [[a, str(self.w.w(a))] for a in members] if kind is ReferenceSpaceKind.ATTRIBUTE else []}
            self.spaces[sid] = ReferenceSpace(reference_space_id=sid, kind=kind, tick=tick, members=tuple(members),
                                              weight_set_ref=self.i.weight_set.weight_set_id
                                              if kind is ReferenceSpaceKind.ATTRIBUTE else None,
                                              space_hash=content_hash(body))
        return sid

    def add(self, mid: MetricId, nd: NumDen | None, rel: EvaluatedRelation, agg: Aggregation, space: str,
            tick: int | None, subset: CaseSubset | None = None) -> None:
        r = make_result(mid, nd, relation=rel, aggregation=agg, reference_space=space, tick=tick, case_subset=subset)
        self.results.append(r)
        if nd is None:
            self.errors.append(ErrorRecord(code=ErrorCodeC.METRIC_UNDEFINED, field=FieldId.F06, tick=tick,
                                           message=f"{mid.value} {rel.value} {agg.value}: input missing",
                                           recovery=RecoveryAction.RECOMPUTE))

    def series(self, mid: MetricId, rel: EvaluatedRelation, per: Sequence[tuple[int, NumDen | None]], kind: ReferenceSpaceKind,
               members: Sequence[str], subset: CaseSubset | None = None, suffix: str = "",
               tick_members: Callable[[int], Sequence[str]] | None = None) -> None:
        """PER_TICK per element of the metric's tick set, then POOLED and TIME_MEAN_EXPLICIT over it (07.7)."""
        for t, nd in per:
            self.add(mid, nd, rel, Aggregation.PER_TICK, self.space(kind, t, tick_members(t) if tick_members else members, suffix),
                     t, subset)
        avail = [nd for _, nd in per if nd is not None]
        pooled_space = self.space(kind, None, members, suffix)
        self.add(mid, aggregation.pooled(avail) if avail else None, rel, Aggregation.POOLED, pooled_space, None, subset)
        self.add(mid, aggregation.time_mean(avail) if avail else None, rel, Aggregation.TIME_MEAN_EXPLICIT, pooled_space,
                 None, subset)

    # ---- views -------------------------------------------------------------------------------------------
    def a_vals(self, t: int) -> dict[str, tuple[bool, str | None]]:
        return {v.attribute_ref: (v.applicability is Applicability.APPLICABLE, v.value) for v in self.i.states[t].values}

    def bundle_for(self, t: int) -> ObservationBundle | None:
        cands = [b for k, b in self.i.bundles.items() if k >= t]
        return min(cands, key=lambda b: b.up_to_tick) if cands else None

    def o_vals(self, t: int) -> dict[str, tuple[str, str | None, bool]] | None:
        b = self.bundle_for(t)
        if b is None:
            return None
        return omega_f06(b, t, self.universe, self.decl)

    def r_vals(self, t: int, attempt: int = 0) -> dict[str, tuple[str, str | None, str | None]] | None:
        rec = self.i.reconstructions.get((t, attempt))
        if rec is None:
            return None
        got: dict[str, tuple[str, str | None, str | None]] = {
            v.attribute_ref: (v.status.value, v.value, v.epistemic_class.value if v.epistemic_class else None)
            for v in rec.output.values}
        out: dict[str, tuple[str, str | None, str | None]] = {}
        for a in self.universe:
            if self.decl.get(a) is Applicability.NOT_APPLICABLE:
                out[a] = ("NOT_APPLICABLE", None, None)
            else:
                out[a] = got.get(a, ("UNDETERMINED", None, "OPEN_REFERENCE"))
        return out

    def tick_view(self, t: int, attempt: int = 0) -> TickView | None:
        av, ov, rv = self.a_vals(t), self.o_vals(t), self.r_vals(t, attempt)
        if ov is None:
            ov = {a: ("UNKNOWN", None, False) for a in self.universe}
        return TickView(tick=t, sweep_tick=rv is not None, attrs=tuple(
            AttrState(attribute=a, a_applicable=av[a][0], a_value=av[a][1], o_status=ov[a][0], o_value=ov[a][1],
                      o_stale=ov[a][2], r_status=rv[a][0] if rv else None, r_value=rv[a][1] if rv else None,
                      r_class=rv[a][2] if rv else None) for a in self.universe))

    # ---- rules ---------------------------------------------------------------------------------------------
    def lookup(self, space: StateSpace, t: int):  # type: ignore[no-untyped-def]
        if space is StateSpace.A:
            av = self.a_vals(t)
            return lambda a: av[a][1] if av[a][0] else Bottom(EvalReason.NOT_APPLICABLE_INPUT)
        if space is StateSpace.O:
            ov = self.o_vals(t)
            if ov is None:
                return None

            def lo(a: str) -> str | Bottom:
                s, v, _ = ov[a]
                if s == "KNOWN":
                    assert v is not None
                    return v
                return Bottom(EvalReason.NOT_APPLICABLE_INPUT if s == "NOT_APPLICABLE" else EvalReason.UNKNOWN_INPUT)
            return lo
        rv = self.r_vals(t)
        if rv is None:
            return None

        def lr(a: str) -> str | Bottom:
            s, v, _ = rv[a]
            if s == "DETERMINED":
                assert v is not None
                return v
            return Bottom(EvalReason.NOT_APPLICABLE_INPUT if s == "NOT_APPLICABLE" else EvalReason.UNDETERMINED_INPUT)
        return lr

    def rules(self) -> None:
        g = self.i.governance
        state_ids = [r.rule_id for r in g.rules if r.kind is RuleKind.STATE]
        trans_ids = [r.rule_id for r in g.rules if r.kind is RuleKind.TRANSITION]
        state_rules = tuple(r for r in g.rules if r.kind is not RuleKind.TRANSITION)
        rel = {StateSpace.A: EvaluatedRelation.A, StateSpace.O: EvaluatedRelation.O, StateSpace.R: EvaluatedRelation.R}
        self.fn_results: dict[str, list[tuple[int, str]]] = {f: [] for f in self.i.service_functions}
        for sp in (StateSpace.A, StateSpace.O, StateSpace.R):
            ticks = self.ticks if sp is not StateSpace.R else list(self.i.sweep_ticks)
            per2: list[tuple[int, NumDen | None]] = []
            per3: list[tuple[int, NumDen | None]] = []
            for t in ticks:
                cur = self.lookup(sp, t)
                if cur is None:
                    per2.append((t, None))
                    continue
                nxt = self.lookup(sp, t + 1) if t + 1 in self.ticks else None
                gs = evaluate_set(g, self.gov_ref, sp, t, cur, nxt)
                self.rule_sets.append(gs)
                st = [(e.rule_ref, e.result.value) for e in gs.evaluations if e.rule_ref in state_ids]
                niv = sum(1 for r in state_rules if r.kind is RuleKind.STATE and not r.valid_at(t))
                per2.append((t, m02.m02(RuleTickView(tick=t, results=tuple(st), not_in_validity=niv))))
                if sp is StateSpace.A:
                    for e in gs.evaluations:
                        if e.rule_ref in self.fn_results:
                            self.fn_results[e.rule_ref].append((t, e.result.value))
            avail = [t for t in ticks if self.lookup(sp, t) is not None]
            pairs = consecutive_pairs(avail)
            for a, _b in pairs:
                gs = next(x for x in self.rule_sets if x.space is sp and x.tick == a)
                tr = [(e.rule_ref, e.result.value) for e in gs.evaluations if e.rule_ref in trans_ids]
                per3.append((a, m03.m03(RuleTickView(tick=a, results=tuple(tr)))))
            self.series(MetricId.M02, rel[sp], per2, ReferenceSpaceKind.RULE, state_ids, suffix=f":{sp.value}")
            if pairs:
                self.series(MetricId.M03, rel[sp], per3, ReferenceSpaceKind.TRANSITION, trans_ids, suffix=f":{sp.value}")
            else:  # no pair in the tick set (e.g. schedule FINAL/EXPLICIT): INPUT_MISSING for both aggregates (07.3)
                self.series(MetricId.M03, rel[sp], [], ReferenceSpaceKind.TRANSITION, trans_ids, suffix=f":{sp.value}")
        # M04 (A_only/v1)
        series = tuple(FunctionSeries(function_ref=f, values=tuple(v)) for f, v in self.fn_results.items())
        all_ticks = [str(t) for t in self.ticks]
        for s in series:
            per4 = [(t, m04.m04(FunctionSeries(function_ref=s.function_ref, values=((t, r),)))) for t, r in s.values]
            self.series(MetricId.M04, EvaluatedRelation.A, per4, ReferenceSpaceKind.TICK, all_ticks, suffix=f":{s.function_ref}",
                        tick_members=lambda t: [str(t)])
        by_tick: dict[int, list[tuple[int, str]]] = {}
        for s in series:
            for t, r in s.values:
                by_tick.setdefault(t, []).append((t, r))
        per_all = [(t, m04.m04_pooled(tuple(FunctionSeries(function_ref=s.function_ref, values=tuple(v for v in s.values if v[0] == t))
                                            for s in series))) for t in sorted(by_tick)]
        self.series(MetricId.M04, EvaluatedRelation.A, per_all, ReferenceSpaceKind.TICK, all_ticks, suffix=":all_functions",
                    tick_members=lambda t: [str(t)])

    # ---- attribute metrics ---------------------------------------------------------------------------------
    def attributes(self) -> list[AttributeMembership]:
        members = self.universe
        p01: list[tuple[int, NumDen | None]] = []
        p05: list[tuple[int, NumDen | None]] = []
        p11: list[tuple[int, NumDen | None]] = []
        p06: list[tuple[int, NumDen | None]] = []
        memb: list[AttributeMembership] = []
        for t in self.ticks:
            v = self.tick_view(t)
            assert v is not None
            p06.append((t, m06.m06(v, self.w) if self.o_vals(t) is not None else None))
        for t in self.i.sweep_ticks:
            v = self.tick_view(t)
            if v is None or not v.sweep_tick:
                p01.append((t, None))
                p05.append((t, None))
                p11.append((t, None))
                continue
            p01.append((t, m01.m01(v, self.w, self.policy)))
            p05.append((t, m05.m05(v, self.w, self.policy)))
            p11.append((t, m11.m11(v, self.w, self.policy)))
            for a in v.attrs:
                det = a.a_applicable and a.r_status == "DETERMINED" and (self.policy == "include" or a.r_class != "HYPOTHESIS")
                memb.append(AttributeMembership(tick=t, attribute_ref=a.attribute, in_d_ref=a.a_applicable,
                                                in_d_obs=a.a_applicable and a.o_status == "KNOWN", in_d_det=det,
                                                delta=(0 if a.a_value == a.r_value else 1) if det else None,
                                                weight=rational(self.w.w(a.attribute))))
        for mid, rel, per in ((MetricId.M01, EvaluatedRelation.A_R, p01), (MetricId.M05, EvaluatedRelation.A_R, p05),
                              (MetricId.M11, EvaluatedRelation.A_R, p11)):
            if not per:
                self.add(mid, None, rel, Aggregation.POOLED, self.space(ReferenceSpaceKind.ATTRIBUTE, None, members), None)
            else:
                self.series(mid, rel, per, ReferenceSpaceKind.ATTRIBUTE, members)
        self.series(MetricId.M06, EvaluatedRelation.A_O, p06, ReferenceSpaceKind.ATTRIBUTE, members)
        return memb

    # ---- gaps ------------------------------------------------------------------------------------------------
    def gaps(self) -> list[GapMatch]:
        ann = self.i.annotations
        matcher = self.i.metric_config.gap_matcher
        vis = frozenset(self.i.config.visible_nodes)
        cases = tuple(CaseView(case_id=c.case_id, nodes=normalize(c.subject_refs, self.applies), tick_from=c.tick_from,
                               tick_to=c.tick_to) for c in (ann.cases if ann else ()))
        case_ids = [c.case_id for c in cases]
        out: list[GapMatch] = []
        p7: list[tuple[int, NumDen | None]] = []
        p7o: list[tuple[int, NumDen | None]] = []
        p8: list[tuple[int, NumDen | None]] = []
        for t in self.i.sweep_ticks:
            rec = self.i.reconstructions.get((t, 0))
            if rec is None or ann is None:
                p7.append((t, None))
                p7o.append((t, None))
                p8.append((t, None))
                continue
            gs = tuple(GapView(gap_id=g.gap_id, tick=t, nodes=normalize(g.subject_refs, self.applies))
                       for g in rec.output.gaps if g.status.value == "OPEN")
            p7.append((t, m07.m07(cases, gs, t)))
            p7o.append((t, m07.m07(cases, gs, t, vis)))
            p8.append((t, m08.m08(cases, gs, t)))
            obs_of = {c.case_id: c.nodes <= vis for c in cases}
            for cid, gid, verdict, key in match(cases, gs, t)[3]:
                out.append(GapMatch(tick=t, case_id=cid, gap_id=gid, verdict=Verdict(verdict),
                                    observable=obs_of.get(cid) if cid else None, matcher=matcher, class_key=key))
        self.series(MetricId.M07, EvaluatedRelation.ANNOTATION_R, p7, ReferenceSpaceKind.CASE, case_ids, CaseSubset.ALL)
        self.series(MetricId.M07, EvaluatedRelation.ANNOTATION_R, p7o, ReferenceSpaceKind.CASE, case_ids,
                    CaseSubset.OBSERVABLE_CASES, ":observable")
        self.series(MetricId.M08, EvaluatedRelation.ANNOTATION_R, p8, ReferenceSpaceKind.CASE, case_ids)
        return out

    def stability(self) -> None:
        t = self.i.stability_tick
        r1 = self.r_vals(t, 0) if t is not None else None
        r2 = self.r_vals(t, 1) if t is not None else None
        if t is None or r1 is None or r2 is None:  # INPUT_MISSING without attempt = 1 (07.3)
            self.series(MetricId.M10, EvaluatedRelation.R1_R2, [] if t is None else [(t, None)], ReferenceSpaceKind.ATTRIBUTE,
                        self.universe, suffix=":stability")
            return
        av = self.a_vals(t)
        ref = tuple(a for a in self.universe if av[a][0])

        def det(r: Mapping[str, tuple[str, str | None, str | None]]) -> tuple[tuple[str, str], ...]:
            return tuple((a, str(v[1])) for a, v in sorted(r.items()) if v[0] == "DETERMINED" and a in ref
                         and (self.policy == "include" or v[2] != "HYPOTHESIS"))
        # tick set = {stability tick}: PER_TICK, POOLED and TIME_MEAN_EXPLICIT over that one tick (07.3, 07.7)
        self.series(MetricId.M10, EvaluatedRelation.R1_R2, [(t, m10.m10(StabilityView(reference=ref, r1=det(r1), r2=det(r2)), self.w))],
                    ReferenceSpaceKind.ATTRIBUTE, self.universe, suffix=":stability")

    def run(self) -> EvaluationOutput:
        self.rules()
        memb = self.attributes()
        matches = self.gaps()
        self.stability()
        mc = self.i.metric_config
        strategies: list[StrategyRef] = [mc.hypothesis_policy, mc.coverage_weighting, mc.service_function_spaces,
                                         mc.closure_basis, mc.stability_source, mc.gap_matcher]
        undefined_input = any(r.undefined_reason is not None and r.undefined_reason.value == "INPUT_MISSING"
                              for r in self.results)
        rs_refs = tuple(make_ref("rule_evaluation_set", s) for s in self.rule_sets)
        report = EvaluationReport(
            report_key="report:evaluation", version=REPORT_VERSION, inputs=tuple(self.i.input_refs),
            reference_spaces=tuple(self.spaces[k] for k in sorted(self.spaces)), results=tuple(self.results),
            rule_evaluations=rs_refs, gap_matches=tuple(matches), strategies=tuple(strategies),
            errors=tuple(self.errors), data_origin=self.i.data_origin,
            execution_status=ExecutionStatus.PARTIAL if (undefined_input or self.i.extra_errors) else ExecutionStatus.COMPLETED,
            attribute_membership=tuple(memb))
        return EvaluationOutput(report=report, rule_sets=tuple(self.rule_sets))


def evaluate_experiment(inp: EvaluationInputs) -> EvaluationOutput:
    return Evaluator(inp).run()

