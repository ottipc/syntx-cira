"""F06_METRICS facade — metric kernel M01–M11 on view types (Kap. 07; U-05)."""

from __future__ import annotations

from typing import Any


def evaluate_experiment(*args: Any, **kwargs: Any) -> Any:
    raise NotImplementedError("F06 evaluate_experiment — Phase 03 (kernel complete in Phase 01)")


def compare_experiments(*args: Any, **kwargs: Any) -> Any:
    raise NotImplementedError("F06 compare_experiments — Phase 03 (kernel complete in Phase 01)")


__all__ = ["evaluate_experiment", "compare_experiments"]
