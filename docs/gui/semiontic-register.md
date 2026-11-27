# Semiontic register (generated)

> Generated from `frontend/semiontics/cira.semiontics.yaml`. Do not edit.

| SEM | Name | Shape | Colour | Glyph | Pattern | Bound states | Views | Primitive | TERM | Exclusion |
|---|---|---|---|---|---|---|---|---|---|---|
| SEM-001 | Space anchor reference | rect sharp | `space.actual` | — | — | StateSpace=A; Applicability=APPLICABLE | 1, 2, 3, 9, 10 | SpaceHeader | `space.a` | never for observed or reconstructed values |
| SEM-002 | Space anchor observed | rect chamfer | `space.observed` | — | — | StateSpace=O | 1, 2, 3, 4, 9 | SpaceHeader | `space.o` | never for Ω_A or system errors |
| SEM-003 | Space anchor reconstructed | octagon double | `space.reconstructed` | — | — | StateSpace=R; ReconstructionStatus=DETERMINED | 1, 2, 3, 5, 6, 7, 8, 9 | SpaceHeader | `space.r` | never as secured ground truth |
| SEM-004 | Observed value | dot filled | `space.observed` | ● | — | ObservationStatus=KNOWN | 2, 3, 4 | SpaceCell | `obs.known` | never without source_id |
| SEM-005 | Observed delayed | dot half | `space.observed` | ◐ | lag-tag | ProjectedValue.stale | 3, 4, 9 | SpaceCell | `obs.known.stale` | never as UNKNOWN or FALSE |
| SEM-006 | Not observed | frame dashed | `open.epistemic` | ○? | open.hatch | ObservationStatus=UNKNOWN | 2, 3, 4 | SpaceCell | `obs.unknown` | never red; never FALSE or NOT_APPLICABLE |
| SEM-007 | Not determined | octagon open slash | `open.epistemic` | ○/ | open.hatch | ReconstructionStatus=UNDETERMINED; AssessmentStatus=UNDETERMINED | 2, 3, 5, 6, 9 | SpaceCell | `rec.undetermined` | never UNKNOWN or FALSE |
| SEM-008 | Not applicable | rect dotted empty | `open.absent` | N/A | — | Applicability=NOT_APPLICABLE; ObservationStatus=NOT_APPLICABLE; ReconstructionStatus=NOT_APPLICABLE | 2, 3, 4 | SpaceCell | `app.na` | not counted as gap or error |
| SEM-009 | No reconstruction at tick | gap dotted | `open.absent` | —@t | — | ContentAvailability=NOT_AVAILABLE_AT_TICK | 3, 5, 6, 7, 8 | SpaceCell | `avail.none` | not VIEW_DATA_UNAVAILABLE |
| SEM-010 | Satisfied | diamond | `eval.coherent` | ◆1 | — | RuleResult=TRUE; AssessmentStatus=MET; Verdict=TP; EventStatus=APPLIED | 2, 3, 6, 7, 8, 9, 10, 11 | RuleDiamond | `rule.true` | never for execution completion |
| SEM-011 | Violated | diamond | `eval.violation` | ◆0 | — | RuleResult=FALSE; AssessmentStatus=NOT_MET; Verdict=FN/FP; EventStatus=REJECTED | 2, 3, 6, 7, 8, 9, 10, 11 | RuleDiamond | `rule.false` | never for UNEVALUABLE |
| SEM-012 | Not evaluable | diamond hatched | `open.epistemic` | ◇⊥ | open.hatch | RuleResult=UNEVALUABLE | 2, 3, 8, 9, 10 | RuleDiamond | `rule.unevaluable` | always with reason; never FALSE |
| SEM-013 | Origin test fixture | capsule striped | `ink.secondary` | ▨ | fixture.stripe | DataOrigin=FIXTURE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | OriginBadge | `origin.fixture` | never hidden (AK-09) |
| SEM-014 | Origin synthetic | capsule hairline | `ink.secondary` | — | — | DataOrigin=SYNTHETIC | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | OriginBadge | `origin.synthetic` | never for F05 outputs |
| SEM-015 | Origin engine | capsule dot | `ink.secondary` | ● | — | DataOrigin=ENGINE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | OriginBadge | `origin.engine` | only with a real adapter |
| SEM-016 | Origin imported | capsule double | `ink.secondary` | ⇩ | — | DataOrigin=IMPORTED | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | OriginBadge | `origin.imported` | distinct from FIXTURE and ENGINE |
| SEM-017 | Origin illustrative | capsule dashed | `ink.secondary` | — | — | DataOrigin=ILLUSTRATIVE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | OriginBadge | `origin.illustrative` | never as measured metric |
| SEM-018 | Epistemic class | capsule | `ink.secondary` | — | — | EpistemicClass=SOURCE_OBSERVATION/SOURCE_STATEMENT/STRUCTURAL_DERIVATION/HYPOTHESIS/OPEN_REFERENCE | 3, 5, 6, 7 | EpistemicChip | `epi` | OPEN_REFERENCE never at DETERMINED |
| SEM-019 | Information barrier | line double | `eval.violation` | ‖ | — | — | 1 | BarrierLine | `barrier` | no pass-through or hover connection |
| SEM-020 | Recovery loop | line double diamond | `ink.secondary` | ◇ | — | — | 1, 8, 10 | RecoveryGateLine | `loop.recovery` | never a closed automatic loop |
| SEM-021 | Rational metric | fraction | `ink.primary` | — | — | MetricStatus=EVALUATED | 9, 10, 8 | RationalMetric | `metric.value` | never without n/d; never an overall index |
| SEM-022 | Undefined metric | slot hatched | `open.epistemic` | ∅ | open.hatch | MetricStatus=UNDEFINED; UndefinedReason=ZERO_DENOMINATOR/INPUT_MISSING | 9, 10, 8 | UndefinedSlot | `metric.undefined` | never 0.00 or 0 % |
| SEM-023 | State change | arrow | `space` | ▸ | — | DeltaStateA; DeltaStateO; DeltaStateR; DeltaCoupling | 2, 3, 4, 11 | DeltaMark | `delta` | always bound to a space (K-13) |
| SEM-024 | Open structural gap | frame open | `open.epistemic` | ◰ | — | GapStatus=OPEN | 2, 7, 8 | GapMark | `gap.open` | always with a source reference |
| SEM-025 | Closed structural gap | frame closed | `eval.coherent` | ◼ | — | GapStatus=CLOSED_IN_RESULT | 7, 8 | GapMark | `gap.closed` | bound to the later result |
| SEM-026 | Merge conflict | bracket | `ink.primary` | ⟦≠⟧ | — | MergeResolution=UNDETERMINED/ENGINE_RESOLVED | 3, 5, 6, 8 | ConflictBracket | `merge.conflict` | shows UNDETERMINED or resolution by origin |
| SEM-027 | Engine datum | frame code | `ink.primary` | — | — | OperatorRef; SigmaRef | 5, 6 | EngineToken | `engine.field` | no guessed translation (K-33) |
| SEM-028 | Quarantine | frame warning | `eval.violation` | ⚠ | — | ViewStatus=VIEW_DATA_UNAVAILABLE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | Quarantine | `msg.unavailable` | masks stale data immediately |
| SEM-029 | Termination seal | seal | `ink.secondary` | ▣ | — | TerminationReason=CONVERGED/ENGINE_REPORTED_STOP/BUDGET_EXHAUSTED/TRUNCATED/ERROR/CANCELLED | 5, 6, 8 | TerminationSeal | `term` | missing only for BLOCKED |
| SEM-030 | Continuity band | band | `space.observed` | — | — | Continuity=CONTINUOUS/INTERRUPTED | 4, 11 | ContinuityBand | `obs.continuity` | exact tick-range gaps |
| SEM-031 | Outside observation window | slot crosshatch | `open.absent` | ▨ | outside.crosshatch | Node.outside_theta | 2, 3, 7 | SpaceCell | `obs.outside` | never equal to UNKNOWN (SEM-006) |
| SEM-032 | Execution status | pill | `ink.primary` | — | — | ExecutionStatus=CREATED/RUNNING/COMPLETED/PARTIAL/FAILED/BLOCKED | 1, 5, 6, 11 | ExecPill | `exec` | never in cells, never as rule truth |
| SEM-033 | Narration card | card | `ink.primary` | — | — | Session.demo_step | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | NarrationCard | `demo` | never over data values, never modal |
| SEM-034 | Focus ring | ring | `ink.primary` | — | — | Session.focus | 2, 3, 4, 7, 8 | FocusRing | `focus` | no space or evaluation colour |
| SEM-035 | Deviation seam | seam | `eval.violation` | ┆ | — | AttributeMembership.delta | 2, 3 | DeviationSeam | `dev.mismatch` | never computed on the client |
| SEM-036 | Presentation frame | frame | `border.strong` | — | — | Session.mode_presentation | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | PresentationFrame | `mode.presentation` | no change of meaning |
| SEM-037 | Coupling line | line | `space.reconstructed` | — | — | CouplingStatus=EFFECTIVE/POSSIBLE/UNKNOWN_OPEN | 2, 5, 6, 8 | RelationEdgePath | `cpl` | coupling status, separate from topology relation type (GK-04, ADR-0005) |
| SEM-038 | Linked to selection | outline-offset-solid | `ink.secondary` | — | — | Focus.resonant | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 | ResonanceMark | `focus.linked` | never a similarity, never a value agreement; only documented relations of the focused item (04.4) |

## Decoration (no sign)

> Decorative elements carry no statement. They never use a sign colour, never carry `data-sem`, and stay below the text contrast limits (TX22, TX23).

| DEC | Name | Where | Form | Meaning |
|---|---|---|---|---|
| DEC-01 | brand mark | zone A, favicon | emblem image (circle with antlers) in brand.core glow | none — identity of the workspace only; never a state, value or rule |
| DEC-02 | neural field | zone C background, behind all blocks | fixed node mesh in brand.core at ≤ opacity network.max, slow pulse (none under reduced motion) | none — never encodes data; generated from a fixed seed, independent of any projection |
| DEC-03 | chain connector | view 01 layer chain | brand.core line with glow between consecutive fields | only the fixed order F01 → F07; couplings and the barrier keep their own signs (SEM-019, SEM-037) |
| DEC-04 | emblem watermark | zone C, at the stage anchor (05.17) | high-resolution calyx raster + two vector rings (ratio 0.914) in brand.core, at decor.alpha.text under text-bearing ground and decor.alpha.reserve on reserve ground; breathes with motion.brand.breath | none — identity only; its position is a function of the stage, never of content |
| DEC-05 | radial arcs | zone C, centred on the emblem | concentric arc pairs (ratio 0.914), static | none — never a gauge, never around a value |
| DEC-06 | emblem axes | zone C, reserve ground only | three vertical lines at the ring centre and both outer-ring tangents, brand.core at decor.axis.alpha | none — compositional geometry derived from the emblem |
| DEC-07 | vignette | zone C, centred on the anchor | radial darkening toward the edges (void), static | none |
| DEC-08 | emblem light | zone C, inside the reserve column | radial brand.core glow (decor.light.alpha → 0 within decor.light.radius × R); breathes with DEC-04; dims while a focus scope is active | none — the single light source of the workspace; never changes with data |
