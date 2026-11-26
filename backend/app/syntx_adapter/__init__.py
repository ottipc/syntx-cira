"""F05_SYNTX_ENGINE facade (Kap. 04 F05): Ω_R(t) = R(Ω_O(0:t)) via independent forward and inverse sweeps.
Input only ObservationBundle + observation-based TargetDefinition (K-11). No access to Ω_A in any form."""

from __future__ import annotations

from .adapters import make_adapter
from .protocol import AdapterResult, EngineAdapter
from .registry import LABEL_UNAVAILABLE, labels
from .sweep import SweepOutcome, run_sweeps

__all__ = ["run_sweeps", "make_adapter", "SweepOutcome", "EngineAdapter", "AdapterResult", "labels",
           "LABEL_UNAVAILABLE"]
