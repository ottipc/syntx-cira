"""Replay (T03, TX16, K-23): SYNTHETIC recomputes everything from the definitions; PRESERVED_ENGINE (Phase 03)
reuses the original F05 outputs. The ReplayReport compares the highest revision per (type, logical_key)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from ..contracts.experiments import ReplayMatch, ReplayReport, ReplayVerdict
from ..contracts.f03 import ExperimentDefinition, ReplayMode
from ..store import ArtifactStore

if TYPE_CHECKING:
    from .orchestrator import Orchestrator

NOT_COMPARED = {"experiment_definition", "replay_report", "comparison_report"}


def compare(store: ArtifactStore, original: str, replay: str, mode: ReplayMode) -> ReplayReport:
    def latest(exp: str) -> dict[tuple[str, str], str]:
        out: dict[tuple[str, str], str] = {}
        for e in store.entries(exp):
            if e["artifact_type"] not in NOT_COMPARED:
                out[(e["artifact_type"], e["logical_key"])] = e["artifact_id"]
        return out
    a, b = latest(original), latest(replay)
    keys = sorted(set(a) | set(b))
    matches = tuple(ReplayMatch(artifact_type=t, logical_key=k, original_id=a.get((t, k)), replay_id=b.get((t, k)),
                                equal=a.get((t, k)) == b.get((t, k))) for t, k in keys)
    return ReplayReport(original_experiment_id=original, replay_experiment_id=replay, mode=mode,
                        compared_types=tuple(sorted({t for t, _ in keys})), matches=matches,
                        verdict=ReplayVerdict.IDENTICAL if all(m.equal for m in matches) else ReplayVerdict.DIVERGENT)


def replay(orch: "Orchestrator", original: str, mode: ReplayMode = ReplayMode.SYNTHETIC) -> str:
    defs = orch.definition_payloads(original)
    edef = defs.pop("experiment_definition")
    assert isinstance(edef, ExperimentDefinition)
    new_def = edef.model_copy(update={"replay_of": original, "replay_mode": mode})
    new_def = ExperimentDefinition.model_validate_json(new_def.model_dump_json())
    exp = orch.create_from(defs, new_def)
    orch.run(exp, preserved_from=original if mode is ReplayMode.PRESERVED_ENGINE else None)
    rep = compare(orch.store, original, exp, mode)
    orch.w(exp, "F03").put("replay_report", rep, f"{original}:{exp}", None)
    return exp
