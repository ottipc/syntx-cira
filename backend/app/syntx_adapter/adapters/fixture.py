"""FixtureAdapter (FIXTURE). Reads explicit per-tick test data from synthetic_fixtures/f05_reconstructions only
(path guard). It never executes or imitates an engine computation: every value comes verbatim from the file.
A bundle whose observable nodes or context version do not match the fixture yields ENGINE_UNAVAILABLE."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from ...contracts.common import AdapterKind, ErrorCodeC, ErrorRecord, FieldId, RecoveryAction, load
from ...contracts.f04_public import ObservationBundle, TargetDefinition
from ...contracts.f05 import (AdapterDescriptor, OperatorRegistry, SweepOutput, TargetAssessment, TerminationRecord,
                              TraceStep)
from ..protocol import AdapterResult, ProposalDraft

BASE = (Path(__file__).resolve().parents[4] / "synthetic_fixtures" / "f05_reconstructions").resolve()
REGISTRIES = (Path(__file__).resolve().parents[4] / "synthetic_fixtures" / "f05_registries").resolve()


def _guard(p: Path, base: Path) -> Path:
    rp = p.resolve()
    if base not in rp.parents:
        raise PermissionError(f"FixtureAdapter path guard: {rp} outside {base}")
    return rp


@lru_cache(maxsize=None)
def _files() -> dict[str, dict[str, Any]]:
    out = {}
    for p in sorted(BASE.glob("*.json")):
        d = json.loads(_guard(p, BASE).read_text(encoding="utf-8"))
        if "adapter_config_id" in d:
            out[d["adapter_config_id"]] = d
    return out


def fixture_configs() -> dict[str, str]:
    """adapter_config_id → for_scenario (used by the orchestrator to choose test data, never by F05 logic)."""
    return {k: v["for_scenario"] for k, v in _files().items()}


class FixtureAdapter:
    def __init__(self, config_ref: str) -> None:
        self.config_ref = config_ref
        self.data = _files().get(config_ref)
        reg = None
        if self.data is not None:
            rid = self.data["operator_registry"]
            path = next(p for p in sorted(REGISTRIES.glob("*.json"))
                        if json.loads(p.read_text(encoding="utf-8")).get("registry_id") == rid)
            raw = json.loads(_guard(path, REGISTRIES).read_text(encoding="utf-8"))
            raw.pop("is_fixture", None)
            reg = load(OperatorRegistry, raw)
        self._registry = reg
        self._d = load(AdapterDescriptor, {
            "adapter_id": "adapter.fixture", "kind": AdapterKind.FIXTURE.value, "adapter_version": "1.0.2",
            "engine_version": None, "is_fixture": True,
            "capabilities": {"forward": True, "inverse": True, "merge": False, "trace": True}})

    @property
    def descriptor(self) -> AdapterDescriptor:
        return self._d

    def available(self) -> bool:
        return self.data is not None

    def registry(self) -> OperatorRegistry | None:
        return self._registry

    def _entry(self, bundle: ObservationBundle) -> dict[str, Any] | ErrorRecord:
        def miss(msg: str) -> ErrorRecord:
            return ErrorRecord(code=ErrorCodeC.ENGINE_UNAVAILABLE, field=FieldId.F05, tick=bundle.up_to_tick,
                               message=f"fixture adapter {self.config_ref}: {msg}", recovery=RecoveryAction.IMPORT_RESULT)
        if self.data is None:
            return miss("no fixture data for this adapter configuration")
        nodes = sorted(n.node_id for n in bundle.observable_topology.nodes)
        if nodes != sorted(self.data["observable_nodes"]):
            return miss("observable topology of the bundle differs from the fixture")
        t = bundle.up_to_tick
        e = next((x for x in self.data["ticks"] if x["tick"] == t), None)
        if e is None or e["context_version"] != bundle.contexts[-1].context_version:
            return miss(f"no fixture entry for context ctx:{t}")
        found: dict[str, Any] = e
        return found

    def _result(self, part: dict[str, Any], sweep_local: str, props: list[dict[str, Any]]) -> AdapterResult:
        out = load(SweepOutput, {k: part[k] for k in ("values", "relations", "gaps", "open_relations")})
        steps = tuple(load(TraceStep, {**s, "step_id": f"step:{sweep_local}:{s['step_seq']}"}) for s in part["trace"])
        ta = tuple(load(TargetAssessment, x) for x in part.get("target_assessment", ()))
        return AdapterResult(output=out, steps=steps, termination=load(TerminationRecord, part["termination"]),
                             target_assessment=ta,
                             proposals=tuple(ProposalDraft(p["proposal_id"], tuple(p["subject_refs"]),
                                                           p["description_from_engine"]) for p in props))

    def forward(self, bundle: ObservationBundle, attempt: int) -> AdapterResult:
        e = self._entry(bundle)
        if isinstance(e, ErrorRecord):
            return AdapterResult(error=e)
        return self._result(e["forward"], f"fwd:t{bundle.up_to_tick}:a{attempt}", [])

    def inverse(self, bundle: ObservationBundle, target: TargetDefinition, attempt: int) -> AdapterResult:
        e = self._entry(bundle)
        if isinstance(e, ErrorRecord):
            return AdapterResult(error=e)
        return self._result(e["inverse"], f"inv:t{bundle.up_to_tick}:a{attempt}", e.get("proposals", []))
