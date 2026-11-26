"""Static, versioned metric definitions (MetricDefinition registry, 07.2) served by /metrics (K-65)."""

from __future__ import annotations

from ..contracts.common import Rational
from ..contracts.f06 import EvaluatedRelation as R
from ..contracts.f06 import MetricDefinition, MetricId

_D = [
    ("M01", "Reconstruction Distance", "Σ_{D_det} w·δ(a,r) / W(D_det)", 0, (R.A_R,), "sweep ticks, attempt 0"),
    ("M02", "Relational Coherence", "#(g_j = TRUE) / #(g_j ∈ {TRUE, FALSE}) over valid STATE rules", 1, (R.A, R.O, R.R),
     "A, O: all ticks; R: sweep ticks"),
    ("M03", "Temporal State Consistency", "#(g_j(s_t, s_t+1) = TRUE) / #(… ∈ {TRUE, FALSE}) over TRANSITION rules", 1,
     (R.A, R.O, R.R), "consecutive available tick pairs"),
    ("M04", "Functional Continuity", "#(f(t) = 1) / #(f(t) ∈ {0, 1})", 1, (R.A,), "all ticks (A_only/v1)"),
    ("M05", "Reconstruction Coverage", "W(D_det) / W(D_ref)", 1, (R.A_R,), "sweep ticks, attempt 0"),
    ("M06", "Observation Completeness", "W(D_obs) / W(D_ref)", 1, (R.A_O,), "all ticks"),
    ("M07", "GAP Detection Coverage", "TP / (TP + FN)", 1, (R.ANNOTATION_R,), "sweep ticks; ALL and OBSERVABLE_CASES"),
    ("M08", "GAP Detection Precision", "TP / (TP + FP)", 1, (R.ANNOTATION_R,), "sweep ticks"),
    ("M09", "GAP Closure", "#resolved / #original", 1, (R.BASELINE_RECOVERY,), "comparison_tick"),
    ("M10", "Reconstruction Stability", "(W(S) − Σ_S w·δ(r1, r2)) / W(S)", 1, (R.R1_R2,), "stability tick"),
    ("M11", "Reconstruction Accuracy", "(W(D_det) − Σ_{D_det} w·δ) / W(D_det)", 1, (R.A_R,), "sweep ticks, attempt 0"),
]
DEFINITIONS: tuple[MetricDefinition, ...] = tuple(
    MetricDefinition(metric_id=MetricId(i), version="1.0.0", name=n, formula=f, target_value=Rational(n=t, d=1),
                     relations=rel, tick_set=ts) for i, n, f, t, rel, ts in _D)
