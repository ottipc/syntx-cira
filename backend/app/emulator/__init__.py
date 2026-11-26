"""F03_EMULATOR facade (Kap. 04 F03): deterministic progression of predefined abstract test states."""

from __future__ import annotations

from .runner import Emulation, actual_values, run_scenario, validate_scenario

__all__ = ["run_scenario", "validate_scenario", "actual_values", "Emulation"]
