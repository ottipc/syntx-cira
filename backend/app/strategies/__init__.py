"""Strategy registry (Kap. 14, K-45). Every switchable behaviour is selected here and recorded as StrategyRef."""

from __future__ import annotations

from ..contracts.common import StrategyRef

REGISTRY: dict[str, tuple[str, ...]] = {
    "merge.policy": ("engine_first",),
    "metrics.hypothesis_policy": ("include", "exclude"),
    "metrics.coverage_weighting": ("weighted",),
    "metrics.service_function_spaces": ("a_only",),
    "metrics.closure_basis": ("state_rules_a_final_tick",),
    "metrics.stability_source": ("resweep_same_bundle",),
    "metrics.gap_matcher": ("subjects_tickwindow_1to1",),
    "observation.budget_unit": ("items_bytes",),
    "ui.closure_view": ("gaps_relations_termination_m09",),
}
DEFAULTS: dict[str, str] = {p: v[0] for p, v in REGISTRY.items()}


def ref(point: str, variant: str | None = None, version: int = 1) -> StrategyRef:
    v = variant or DEFAULTS[point]
    if v not in REGISTRY[point]:
        raise ValueError(f"unknown strategy {point}:{v}")
    return StrategyRef(point=point, variant=v, version=version)


def variant_of(r: StrategyRef) -> str:
    if r.variant not in REGISTRY.get(r.point, ()):
        raise ValueError(f"unknown strategy {r.key()}")
    return r.variant
