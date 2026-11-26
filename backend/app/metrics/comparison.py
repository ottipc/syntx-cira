"""Comparability for M09 (07.5, K-43). Incompatible pairs yield COMPARISON_INCOMPATIBLE with reasons."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ScenarioMeta:
    scenario_id: str
    variant_kind: str
    variant_of: str | None
    fixture_lineage_id: str
    topology_version: str
    governance_version: str
    tick_count: int


def incompatibility(baseline: ScenarioMeta, recovery: ScenarioMeta, tau: int | None) -> list[str]:
    reasons: list[str] = []
    if baseline.fixture_lineage_id != recovery.fixture_lineage_id:
        reasons.append("fixture_lineage_id differs")
    if baseline.topology_version != recovery.topology_version:
        reasons.append("topology version differs")
    if baseline.governance_version != recovery.governance_version:
        reasons.append("governance version differs")
    if baseline.variant_kind != "BASELINE":
        reasons.append("baseline is not variant_kind BASELINE")
    if recovery.variant_kind != "RECOVERY":
        reasons.append("recovery is not variant_kind RECOVERY")
    if recovery.variant_of != baseline.scenario_id:
        reasons.append("recovery.variant_of is not the baseline scenario")
    t = default_tau(baseline, recovery) if tau is None else tau
    if not (0 <= t < baseline.tick_count and t < recovery.tick_count):
        reasons.append("comparison_tick outside both tick ranges")
    return reasons


def default_tau(baseline: ScenarioMeta, recovery: ScenarioMeta) -> int:
    return min(baseline.tick_count, recovery.tick_count) - 1
