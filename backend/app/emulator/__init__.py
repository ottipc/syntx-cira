"""F03_EMULATOR facade (Kap. 04 F03). Port signatures fixed in Phase 01; behaviour in Phase 02 (15.3)."""

from __future__ import annotations

from typing import Any


def run_scenario(*args: Any, **kwargs: Any) -> Any:
    raise NotImplementedError("F03 run_scenario — Phase 02")


def replay_report(*args: Any, **kwargs: Any) -> Any:
    raise NotImplementedError("F03 replay_report — Phase 02")


__all__ = ["run_scenario", "replay_report"]
