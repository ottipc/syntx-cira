"""Independent forward and inverse sweeps, then reconstruction (REQ-029, REQ-030, T08, T12, K-22, K-35).

Forward sees only the bundle; inverse sees the bundle and the observation-based target. Neither references the
other. A SweepRun is produced once, with its final status, derived from the TerminationRecord (06.3).
"""

from __future__ import annotations

from dataclasses import dataclass

from ..contracts.common import ArtifactRef, ContentOpenness, ExecutionStatus, ObservationStatus, ReconstructionStatus
from ..contracts.common import ReferenceStatus, StrategyRef, make_ref
from ..contracts.f04_public import ObservationBundle, TargetDefinition
from ..contracts.f05 import (ForwardResult, InverseResult, ReconstructionResult, RecoveryProposal, SweepDirection,
                             SweepOutput, SweepRun, SweepTrace, TerminationReason)
from ..core.ids import recon_id, sweep_id
from .delta import deltas
from .merge import merge
from .protocol import AdapterResult, EngineAdapter

FINAL = {TerminationReason.CONVERGED: ExecutionStatus.COMPLETED,
         TerminationReason.ENGINE_REPORTED_STOP: ExecutionStatus.COMPLETED,
         TerminationReason.BUDGET_EXHAUSTED: ExecutionStatus.PARTIAL,
         TerminationReason.TRUNCATED: ExecutionStatus.PARTIAL,
         TerminationReason.CANCELLED: ExecutionStatus.PARTIAL,
         TerminationReason.ERROR: ExecutionStatus.FAILED}


@dataclass(frozen=True)
class SweepOutcome:
    forward_run: SweepRun
    forward: ForwardResult | None
    inverse_run: SweepRun
    inverse: InverseResult | None
    reconstruction: ReconstructionResult | None
    proposals: tuple[RecoveryProposal, ...]


def _run(adapter: EngineAdapter, direction: SweepDirection, bundle: ObservationBundle, bundle_ref: ArtifactRef,
         target_ref: ArtifactRef | None, attempt: int, res: AdapterResult) -> SweepRun:
    t = bundle.up_to_tick
    base = dict(sweep_id=sweep_id(direction.value, t, attempt), direction=direction, attempt=attempt,
                adapter=adapter.descriptor, input_bundle_ref=bundle_ref, target_ref=target_ref, up_to_tick=t,
                context_version=bundle.contexts[-1].context_version)
    if res.error is not None or res.termination is None or res.output is None:
        return SweepRun(execution_status=ExecutionStatus.BLOCKED, error=res.error, **base)  # type: ignore[arg-type]
    return SweepRun(execution_status=FINAL[res.termination.reason], termination=res.termination, **base)  # type: ignore[arg-type]


def openness(out: SweepOutput, bundle: ObservationBundle) -> ContentOpenness:
    observable = {a.attribute_id for n in bundle.observable_topology.nodes for a in n.attributes}
    known = {o.attribute_ref for o in bundle.contexts[-1].observations if o.status is ObservationStatus.KNOWN}
    det = {v.attribute_ref for v in out.values if v.status is ReconstructionStatus.DETERMINED}
    return ContentOpenness(undetermined=len(observable - det), unknown_observations=len(observable - known),
                           open_references=sum(1 for v in out.values if v.reference_status is not ReferenceStatus.RESOLVED),
                           open_relations=len(out.open_relations),
                           structural_gaps_open=sum(1 for g in out.gaps if g.status.value == "OPEN"),
                           unevaluable_rules=0)


def run_sweeps(adapter: EngineAdapter, bundle: ObservationBundle, bundle_ref: ArtifactRef, target: TargetDefinition,
               target_ref: ArtifactRef, attempt: int, merge_policy: StrategyRef,
               previous: ReconstructionResult | None = None) -> SweepOutcome:
    fres = adapter.forward(bundle, attempt)
    ires = adapter.inverse(bundle, target, attempt)
    frun = _run(adapter, SweepDirection.FORWARD, bundle, bundle_ref, None, attempt, fres)
    irun = _run(adapter, SweepDirection.INVERSE, bundle, bundle_ref, target_ref, attempt, ires)
    fwd = inv = None
    if frun.execution_status is not ExecutionStatus.BLOCKED and fres.output is not None:
        fwd = ForwardResult(sweep=frun, output=fres.output,
                            trace=SweepTrace(sweep_id=frun.sweep_id, steps=fres.steps, reference_status=ReferenceStatus.RESOLVED))
    if irun.execution_status is not ExecutionStatus.BLOCKED and ires.output is not None:
        inv = InverseResult(sweep=irun, output=ires.output, target_assessment=ires.target_assessment,
                            trace=SweepTrace(sweep_id=irun.sweep_id, steps=ires.steps, reference_status=ReferenceStatus.RESOLVED))
    recon = None
    props: tuple[RecoveryProposal, ...] = ()
    ok = (ExecutionStatus.COMPLETED, ExecutionStatus.PARTIAL)
    if fwd is not None and inv is not None and frun.execution_status in ok and irun.execution_status in ok:
        out, rec = merge(fwd.output, inv.output, make_ref("forward_result", fwd), make_ref("inverse_result", inv),
                         merge_policy, ires.merged)
        ds = dk = None
        if previous is not None:
            ds, dk = deltas(previous, out, bundle.up_to_tick)
        recon = ReconstructionResult(
            reconstruction_id=recon_id(bundle.up_to_tick, attempt), attempt=attempt, up_to_tick=bundle.up_to_tick,
            context_version=bundle.contexts[-1].context_version, merge=rec, output=out,
            previous_reconstruction_ref=make_ref("reconstruction_result", previous) if previous else None,
            delta_state=ds, delta_coupling=dk, openness=openness(out, bundle))
        rref = make_ref("reconstruction_result", recon)
        props = tuple(RecoveryProposal(proposal_id=p.proposal_id, reconstruction_ref=rref, subject_refs=p.subject_refs,
                                       description_from_engine=p.description_from_engine, status="PROPOSED")
                      for p in ires.proposals)
    return SweepOutcome(forward_run=frun, forward=fwd, inverse_run=irun, inverse=inv, reconstruction=recon,
                        proposals=props)
