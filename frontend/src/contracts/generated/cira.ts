/* GENERATED from contracts/schemas/cira.contracts.schema.json by scripts/gen-contracts.mjs — do not edit (E-10) */

/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Applicability".
 */
export type Applicability = ("APPLICABLE" | "NOT_APPLICABLE")
export type Value = (string | null)
export type AttributeRef = string
export type LastSeq = (number | null)
export type ArtifactId = string
export type ArtifactType = string
export type ContentHash = string
export type Tick = number
export type AttributeRef1 = string
export type Value1 = (string | null)
export type Values = ActualValue[]
export type Forward = boolean
export type Inverse = boolean
export type Merge = boolean
export type Trace = boolean
export type AdapterId = string
export type AdapterVersion = string
export type EngineVersion = (string | null)
export type IsFixture = boolean
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AdapterKind".
 */
export type AdapterKind = ("FIXTURE" | "LOCAL" | "API" | "IMPORT")
export type Available = boolean
export type ConfigRef = string
export type Point = string
export type Variant = string
export type Version = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Aggregation".
 */
export type Aggregation = ("PER_TICK" | "POOLED" | "TIME_MEAN_EXPLICIT")
/**
 * @minItems 2
 */
export type Args = [(Eq | In | Not | And | Or | Implies | TransitionIn), (Eq | In | Not | And | Or | Implies | TransitionIn), ...((Eq | In | Not | And | Or | Implies | TransitionIn))[]]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TimeIndex".
 */
export type TimeIndex = ("CURRENT" | "NEXT")
export type Attr = string
export type Op = "eq"
export type Value2 = string
export type Attr1 = string
export type Op1 = "in"
export type Values1 = string[]
export type Arg = (Eq | In | Not | And | Or | Implies | TransitionIn)
/**
 * @minItems 2
 */
export type Args1 = [(Eq | In | Not | And | Or | Implies | TransitionIn), (Eq | In | Not | And | Or | Implies | TransitionIn), ...((Eq | In | Not | And | Or | Implies | TransitionIn))[]]
export type If = (Eq | In | Not | And | Or | Implies | TransitionIn)
export type From = string
export type To = string
export type Allowed = SymbolPair[]
export type Attr2 = string
export type Op2 = "transition_in"
export type Op3 = "implies"
export type Then = (Eq | In | Not | And | Or | Implies | TransitionIn)
export type Op4 = "or"
export type Op5 = "not"
export type Op6 = "and"
export type ApprovalId = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Decision3".
 */
export type Decision3 = ("APPROVED" | "REJECTED" | "PENDING")
export type Rationale = string
export type RoleRef = string
export type RuleRef = (string | null)
export type SubjectRefs = string[]
export type Tick1 = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AssessmentStatus".
 */
export type AssessmentStatus = ("MET" | "NOT_MET" | "UNDETERMINED")
export type After = (string | null)
export type AttributeRef2 = string
export type Before = (string | null)
export type AttributeId = string
export type DomainRef = string
export type Name = string
export type AttributeRef3 = string
export type Delta = (number | null)
export type InDDet = boolean
export type InDObs = boolean
export type InDRef = boolean
export type Tick2 = number
export type D = number
export type N = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Decision2".
 */
export type Decision2 = ("APPROVED" | "REJECTED")
export type DecisionId = string
export type Rationale1 = string
export type RoleRef1 = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ContentAvailability".
 */
export type ContentAvailability = ("AVAILABLE" | "NOT_AVAILABLE_AT_TICK")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EpistemicClass".
 */
export type EpistemicClass = ("SOURCE_OBSERVATION" | "SOURCE_STATEMENT" | "STRUCTURAL_DERIVATION" | "HYPOTHESIS" | "OPEN_REFERENCE")
export type GapId = string
export type Kind = string
/**
 * @minItems 1
 */
export type SourceRefs = [string, ...(string)[]]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GapStatus".
 */
export type GapStatus = ("OPEN" | "CLOSED_IN_RESULT")
export type SubjectRefs1 = string[]
export type Gaps = StructuralGap[]
export type Reason = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReferenceStatus".
 */
export type ReferenceStatus = ("RESOLVED" | "UNRESOLVED" | "TRUNCATED" | "EXTERNAL")
export type RelationKey = string
export type SubjectRefs2 = string[]
export type OpenRelations = OpenRelation[]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "CouplingStatus".
 */
export type CouplingStatus = ("EFFECTIVE" | "POSSIBLE" | "UNKNOWN_OPEN")
export type DerivedFrom = string[]
export type RelationKey1 = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RelationType".
 */
export type RelationType = ("depends_on" | "reports_to" | "provides")
export type Source = string
export type Target = string
export type Relations = RelationAssertion[]
export type AttributeRef4 = string
export type DerivedFrom1 = string[]
export type ReferenceStatus1 = ("RESOLVED" | "UNRESOLVED" | "TRUNCATED" | "EXTERNAL")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReconstructionStatus".
 */
export type ReconstructionStatus = ("DETERMINED" | "UNDETERMINED" | "NOT_APPLICABLE")
export type Value3 = (string | null)
export type Values2 = ReconstructedValue[]
export type Attempt = number
export type ContextVersion = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepDirection".
 */
export type SweepDirection = ("FORWARD" | "INVERSE")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ErrorCodeC".
 */
export type ErrorCodeC = ("INVALID_TOPOLOGY" | "INVALID_RULE" | "INVALID_TRANSITION" | "CONTEXT_INCOMPLETE" | "ENGINE_UNAVAILABLE" | "METRIC_UNDEFINED" | "VIEW_DATA_UNAVAILABLE" | "SCHEMA_VIOLATION" | "NOT_FOUND" | "CONFLICT" | "ACCESS_VIOLATION" | "IMPORT_INVALID" | "COMPARISON_INCOMPATIBLE")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "FieldId".
 */
export type FieldId = ("F01" | "F02" | "F03" | "F04" | "F05" | "F06" | "F07")
export type Message = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RecoveryAction".
 */
export type RecoveryAction = ("SUBMIT_VALID_DEFINITION" | "REVERT_TO_VERSION" | "REPLAY_FROM_INITIAL" | "RESERIALIZE" | "RESWEEP" | "IMPORT_RESULT" | "RECOMPUTE" | "REFETCH")
export type SubjectRefs3 = string[]
export type Tick3 = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExecutionStatus".
 */
export type ExecutionStatus = ("CREATED" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "BLOCKED")
export type SweepId = string
export type Budget = (number | null)
export type EngineMessage = (string | null)
export type LastStepSeq = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TerminationReason".
 */
export type TerminationReason = ("CONVERGED" | "ENGINE_REPORTED_STOP" | "BUDGET_EXHAUSTED" | "TRUNCATED" | "ERROR" | "CANCELLED")
export type StepsExecuted = number
export type UpToTick = number
export type EngineNote = (string | null)
export type InputRefs = string[]
export type OperatorRef = ((CanonicalOperatorRef | ROperatorRef | IOperatorRef | ExternalOperatorRef) | null)
export type Namespace = "CANONICAL_V181"
export type RegistryVersion = "v1.8.1"
export type Symbol = string
export type Code = string
export type Namespace1 = "R"
export type RegistryVersion1 = string
export type Code1 = string
export type Namespace2 = "I"
export type RegistryVersion2 = string
export type Code2 = string
export type Namespace3 = "EXTERNAL"
export type RegistryVersion3 = string
export type OutputRefs = string[]
export type RegistryVersion4 = string
export type SigmaId = string
export type StepId = string
export type StepSeq = number
export type Steps = TraceStep[]
export type SweepId1 = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "DataOrigin".
 */
export type DataOrigin = ("SYNTHETIC" | "FIXTURE" | "ENGINE" | "IMPORTED" | "ILLUSTRATIVE")
export type DerivedFrom2 = string[]
export type GoalId = string
export type TargetAssessment = TargetAssessment1[]
export type Bytes = number
export type Observations = number
export type MaxBytes = number
export type MaxObservations = number
export type ContextVersion1 = string
export type AttributeRef5 = string
export type ObservationId = string
export type ObservedAtTick = number
export type References = string[]
export type SourceId = (string | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationStatus".
 */
export type ObservationStatus = ("KNOWN" | "UNKNOWN" | "NOT_APPLICABLE")
export type Tick4 = number
export type Value4 = (string | null)
export type Observations1 = Observation[]
export type PreviousContextRef = (string | null)
export type Sequence = number
export type Tick5 = number
export type Value5 = (string | null)
export type AttributeRef6 = string
export type Changes = OChange[]
export type FromTick = number
export type Space = "O"
export type ToTick = number
export type AttributeRef7 = string
export type ObservedAtTick1 = (number | null)
export type SourceId1 = (string | null)
export type Stale = boolean
export type Value6 = (string | null)
export type Projected = ProjectedValue[]
export type Revision = number
export type SerializationProfile = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Continuity".
 */
export type Continuity = ("CONTINUOUS" | "INTERRUPTED")
export type FirstTick = number
export type FromTick1 = number
export type ToTick1 = (number | null)
export type Gaps1 = TickRange[]
export type LastTick = number
export type SourceId2 = string
export type Entries = SourceRegisterEntry[]
export type VisibleNodes = string[]
export type Attempt1 = number
export type ContextVersion2 = string
export type After1 = (CouplingStatus | "ABSENT")
export type Before1 = (CouplingStatus | "ABSENT")
export type RelationKey2 = string
export type Changes1 = CouplingChange[]
export type FromTick2 = number
export type ToTick2 = number
export type Status = (ReconstructionStatus | "ABSENT")
export type Value7 = (string | null)
export type AttributeRef8 = string
export type Changes2 = RChange[]
export type FromTick3 = number
export type Space1 = "R"
export type ToTick3 = number
export type AttributeRef9 = string
export type Forward1 = (string | null)
export type Inverse1 = (string | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MergeResolution".
 */
export type MergeResolution = ("UNDETERMINED" | "ENGINE_RESOLVED")
export type Conflicts = MergeConflict[]
export type EngineMerged = boolean
export type OpenReferences = number
export type OpenRelations1 = number
export type StructuralGapsOpen = number
export type Undetermined = number
export type UnevaluableRules = number
export type UnknownObservations = number
export type ReconstructionId = string
export type UpToTick1 = number
export type InputAttributeRefs = string[]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EvalReason".
 */
export type EvalReason = ("OK" | "UNKNOWN_INPUT" | "UNDETERMINED_INPUT" | "NOT_APPLICABLE_INPUT" | "REQUIREMENT_NOT_MET")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleResult".
 */
export type RuleResult = ("TRUE" | "FALSE" | "UNEVALUABLE")
export type RuleRef1 = string
export type RuleVersion = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StateSpace".
 */
export type StateSpace = ("A" | "O" | "R")
export type Tick6 = number
export type TickTo = (number | null)
export type Evaluations = RuleEvaluation[]
export type NotInValidity = number
export type False = number
export type NotInValidity1 = number
export type True = number
export type Unevaluable = number
export type Tick7 = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "CaseSubset".
 */
export type CaseSubset = ("ALL" | "OBSERVABLE_CASES")
export type Baseline = string
export type ComparisonId = string
export type ComparisonTick = number
export type Compatible = boolean
export type Recovery = string
export type BaselineExperimentId = string
export type ComparisonKey = string
export type ComparisonTick1 = number
export type Compatible1 = boolean
export type FixtureLineageId = string
export type Incompatibility = string[]
export type New = string[]
export type Original = string[]
export type Persisting = string[]
export type RecoveryExperimentId = string
export type Resolved = string[]
export type Fn = (number | null)
export type Fp = (number | null)
export type FunctionRef = (string | null)
export type HypothesesExcluded = (number | null)
export type NewInconsistencies = (number | null)
export type NotApplicableExcluded = (number | null)
export type NotInValidity2 = (number | null)
export type ObservableCases = (number | null)
export type Persisting1 = (number | null)
export type SharedCoverageUndefined = (boolean | null)
export type StaleKnown = (number | null)
export type TicksExcluded = (number | null)
export type TicksIncluded = (number | null)
export type Tp = (number | null)
export type UndeterminedCount = (number | null)
export type UnevaluableCount = (number | null)
export type UnevaluableInRecovery = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricId".
 */
export type MetricId = ("M01" | "M02" | "M03" | "M04" | "M05" | "M06" | "M07" | "M08" | "M09" | "M10" | "M11")
export type ReferenceSpace = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EvaluatedRelation".
 */
export type EvaluatedRelation = ("A" | "O" | "R" | "A_O" | "A_R" | "ANNOTATION_R" | "R1_R2" | "BASELINE_RECOVERY")
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricStatus".
 */
export type MetricStatus = ("EVALUATED" | "UNDEFINED")
export type Tick8 = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "UndefinedReason".
 */
export type UndefinedReason = ("ZERO_DENOMINATOR" | "INPUT_MISSING")
export type Unit = string
export type Value8 = (number | null)
export type Version1 = string
export type Results = MetricResult[]
export type UnevaluableInRecovery1 = string[]
export type ExperimentId = (string | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GuardClass".
 */
export type GuardClass = ("TIMED" | "TIMELESS" | "RANGE" | "COMPARISON" | "GLOBAL")
export type Attempt2 = (number | null)
export type ComparisonId1 = (string | null)
export type Direction = (string | null)
export type From1 = (number | null)
export type Revision1 = (number | null)
export type To1 = (number | null)
export type ToTick4 = (number | null)
export type SchemaVersion = string
export type SourceRefs1 = ArtifactRef[]
export type Tick9 = (number | null)
export type Comparisons = ComparisonListEntry[]
export type ExperimentId1 = string
export type ObservationConfigId = string
export type ScenarioId = string
export type Strategies = StrategyRef[]
export type SweepSchedule = string
export type TargetId = string
export type Tick10 = (number | null)
export type CaseId = string
export type Kind1 = string
export type RuleRef2 = (string | null)
export type SubjectRefs4 = string[]
export type TickFrom = number
export type TickTo1 = (number | null)
export type Cases = ConsistencyCase[]
export type Carrier = string
export type ExperimentId2 = string
export type Self = string
export type View = string
export type Status1 = string
export type Changes3 = AChange[]
export type FromTick4 = number
export type Space2 = "A"
export type ToTick5 = number
export type ArtifactId1 = string
export type ArtifactType1 = "actual_state"
export type ContentHash1 = string
export type ExperimentId3 = (string | null)
export type LogicalKey = string
export type ProducerId = string
export type ProducerVersion = string
export type SourceRefs2 = ArtifactRef[]
export type Revision2 = number
export type SchemaVersion1 = string
export type Tick11 = (number | null)
export type ArtifactId2 = string
export type ArtifactType2 = "authority_record"
export type ContentHash2 = string
export type ExperimentId4 = (string | null)
export type LogicalKey1 = string
export type Revision3 = number
export type SchemaVersion2 = string
export type Tick12 = (number | null)
export type ArtifactId3 = string
export type ArtifactType3 = "comparison_report"
export type ContentHash3 = string
export type ExperimentId5 = (string | null)
export type LogicalKey2 = string
export type Revision4 = number
export type SchemaVersion3 = string
export type Tick13 = (number | null)
export type ArtifactId4 = string
export type ArtifactType4 = "consistency_annotation_set"
export type ContentHash4 = string
export type ExperimentId6 = (string | null)
export type LogicalKey3 = string
export type Revision5 = number
export type SchemaVersion4 = string
export type Tick14 = (number | null)
export type ArtifactId5 = string
export type ArtifactType5 = "evaluation_report"
export type ContentHash5 = string
export type ExperimentId7 = (string | null)
export type LogicalKey4 = string
export type AttributeMembership1 = AttributeMembership[]
export type Errors = ErrorRecord[]
export type CaseId1 = (string | null)
export type ClassKey = string[]
export type GapId1 = (string | null)
export type Observable = (boolean | null)
export type Tick15 = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Verdict".
 */
export type Verdict = ("TP" | "FN" | "FP")
export type GapMatches = GapMatch[]
export type Inputs = ArtifactRef[]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReferenceSpaceKind".
 */
export type ReferenceSpaceKind = ("ATTRIBUTE" | "RULE" | "TRANSITION" | "TICK" | "CASE" | "RULE_KEY")
export type Members = string[]
export type ReferenceSpaceId = string
export type SpaceHash = string
export type Tick16 = (number | null)
export type WeightSetRef = (string | null)
export type ReferenceSpaces = ReferenceSpace1[]
export type ReportKey = string
export type Results1 = MetricResult[]
export type RuleEvaluations = ArtifactRef[]
export type Strategies1 = StrategyRef[]
export type Version2 = string
export type Revision6 = number
export type SchemaVersion5 = string
export type Tick17 = (number | null)
export type ArtifactId6 = string
export type ArtifactType6 = "event_record"
export type ContentHash6 = string
export type ExperimentId8 = (string | null)
export type LogicalKey5 = string
export type Effects = AttributeChange[]
export type EventRef = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "InputEventKind".
 */
export type InputEventKind = ("SET_ATTRIBUTE" | "APPLY_APPROVAL")
export type Seq = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EventStatus".
 */
export type EventStatus = ("APPLIED" | "REJECTED")
export type Tick18 = number
export type Revision7 = number
export type SchemaVersion6 = string
export type Tick19 = (number | null)
export type ArtifactId7 = string
export type ArtifactType7 = "experiment_definition"
export type ContentHash7 = string
export type ExperimentId9 = (string | null)
export type LogicalKey6 = string
export type DefinitionVersion = string
export type Label = string
export type ComparisonTick2 = (number | null)
export type WeightSetRef1 = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayMode".
 */
export type ReplayMode = ("SYNTHETIC" | "PRESERVED_ENGINE")
export type ReplayOf = (string | null)
export type Enabled = boolean
export type Tick20 = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ScheduleMode".
 */
export type ScheduleMode = ("FINAL" | "EVERY_TICK" | "EXPLICIT")
export type Ticks = number[]
export type Revision8 = number
export type SchemaVersion7 = string
export type Tick21 = (number | null)
export type ArtifactId8 = string
export type ArtifactType8 = "forward_result"
export type ContentHash8 = string
export type ExperimentId10 = (string | null)
export type LogicalKey7 = string
export type Revision9 = number
export type SchemaVersion8 = string
export type Tick22 = (number | null)
export type ArtifactId9 = string
export type ArtifactType9 = "governance_definition"
export type ContentHash9 = string
export type ExperimentId11 = (string | null)
export type LogicalKey8 = string
export type GovernanceId = string
export type Label1 = string
export type RoleId = string
export type Roles = RoleDecl[]
export type AppliesTo = string[]
export type Description = string
export type Expression = (Eq | In | Not | And | Or | Implies | TransitionIn)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleKind".
 */
export type RuleKind = ("STATE" | "TRANSITION" | "FUNCTION")
export type Permits = string[]
export type Requires = string[]
export type RuleId = string
export type Scope = string[]
export type ValidFromTick = number
export type ValidUntilTick = (number | null)
export type Version3 = string
export type Rules = Rule[]
export type Version4 = string
export type Revision10 = number
export type SchemaVersion9 = string
export type Tick23 = (number | null)
export type ArtifactId10 = string
export type ArtifactType10 = "immutable_topology"
export type ContentHash10 = string
export type ExperimentId12 = (string | null)
export type LogicalKey9 = string
export type AttributeUniverse = string[]
export type Label2 = string
export type TypeId = string
export type NodeTypes = NodeTypeDecl[]
export type Attributes = AttributeDecl[]
export type Label3 = string
export type NodeId = string
export type NodeType = string
export type Version5 = string
export type Nodes = Node[]
export type RelationId = string
export type Source1 = string
export type Target1 = string
export type Version6 = string
export type Relations1 = Relation[]
export type TopologyId = string
export type DomainId = string
export type Symbols = string[]
export type Version7 = string
export type ValueDomains = ValueDomain[]
export type Version8 = string
export type Revision11 = number
export type SchemaVersion10 = string
export type Tick24 = (number | null)
export type ArtifactId11 = string
export type ArtifactType11 = "inverse_result"
export type ContentHash11 = string
export type ExperimentId13 = (string | null)
export type LogicalKey10 = string
export type Revision12 = number
export type SchemaVersion11 = string
export type Tick25 = (number | null)
export type ArtifactId12 = string
export type ArtifactType12 = "observable_rules"
export type ContentHash12 = string
export type ExperimentId14 = (string | null)
export type LogicalKey11 = string
export type Rules1 = Rule[]
export type Revision13 = number
export type SchemaVersion12 = string
export type Tick26 = (number | null)
export type ArtifactId13 = string
export type ArtifactType13 = "observable_topology"
export type ContentHash13 = string
export type ExperimentId15 = (string | null)
export type LogicalKey12 = string
export type Nodes1 = Node[]
export type Relations2 = Relation[]
export type ValueDomains1 = ValueDomain[]
export type Revision14 = number
export type SchemaVersion13 = string
export type Tick27 = (number | null)
export type ArtifactId14 = string
export type ArtifactType14 = "observation_bundle"
export type ContentHash14 = string
export type ExperimentId16 = (string | null)
export type LogicalKey13 = string
export type BundleKey = string
export type Contexts = ContextBundle[]
export type SerializationProfile1 = string
export type UpToTick2 = number
export type Revision15 = number
export type SchemaVersion14 = string
export type Tick28 = (number | null)
export type ArtifactId15 = string
export type ArtifactType15 = "observation_config"
export type ContentHash15 = string
export type ExperimentId17 = (string | null)
export type LogicalKey14 = string
export type ConfigId = string
export type SerializationProfiles = string[]
export type Active = TickRange[]
export type Label4 = string
export type LagTicks = number
export type Observes = string[]
export type SourceId3 = string
export type Sources = ObservationSource[]
export type Version9 = string
export type VisibleNodes1 = string[]
export type VisibleRelations = string[]
export type VisibleRules = string[]
export type Revision16 = number
export type SchemaVersion15 = string
export type Tick29 = (number | null)
export type ArtifactId16 = string
export type ArtifactType16 = "observation_record"
export type ContentHash16 = string
export type ExperimentId18 = (string | null)
export type LogicalKey15 = string
export type ActualStateRefs = ArtifactRef[]
export type Tick30 = number
export type Revision17 = number
export type SchemaVersion16 = string
export type Tick31 = (number | null)
export type ArtifactId17 = string
export type ArtifactType17 = "operator_registry"
export type ContentHash17 = string
export type ExperimentId19 = (string | null)
export type LogicalKey16 = string
export type DescriptionFromSource = string
export type LabelFromSource = string
export type Ref = (CanonicalOperatorRef | ROperatorRef | IOperatorRef | ExternalOperatorRef)
export type Operators = RegistryOperator[]
export type RegistryId = string
export type Operator = ((CanonicalOperatorRef | ROperatorRef | IOperatorRef | ExternalOperatorRef) | null)
export type RelationLabelFromSource = string
export type SigmaCouplings = RegistryCoupling[]
export type LabelFromSource1 = (string | null)
export type SigmaFields = RegistrySigma[]
export type Source2 = string
export type Version10 = string
export type Revision18 = number
export type SchemaVersion17 = string
export type Tick32 = (number | null)
export type ArtifactId18 = string
export type ArtifactType18 = "reconstruction_result"
export type ContentHash18 = string
export type ExperimentId20 = (string | null)
export type LogicalKey17 = string
export type Revision19 = number
export type SchemaVersion18 = string
export type Tick33 = (number | null)
export type ArtifactId19 = string
export type ArtifactType19 = "recovery_proposal"
export type ContentHash19 = string
export type ExperimentId21 = (string | null)
export type LogicalKey18 = string
export type DescriptionFromEngine = string
export type ProposalId = string
export type Status2 = "PROPOSED"
export type SubjectRefs5 = string[]
export type Revision20 = number
export type SchemaVersion19 = string
export type Tick34 = (number | null)
export type ArtifactId20 = string
export type ArtifactType20 = "replay_report"
export type ContentHash20 = string
export type ExperimentId22 = (string | null)
export type LogicalKey19 = string
export type ComparedTypes = string[]
export type ArtifactType21 = string
export type Equal = boolean
export type LogicalKey20 = string
export type OriginalId = (string | null)
export type ReplayId = (string | null)
export type Matches = ReplayMatch[]
export type OriginalExperimentId = string
export type ReplayExperimentId = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayVerdict".
 */
export type ReplayVerdict = ("IDENTICAL" | "DIVERGENT")
export type Revision21 = number
export type SchemaVersion20 = string
export type Tick35 = (number | null)
export type ArtifactId21 = string
export type ArtifactType22 = "rule_evaluation_set"
export type ContentHash21 = string
export type ExperimentId23 = (string | null)
export type LogicalKey21 = string
export type Revision22 = number
export type SchemaVersion21 = string
export type Tick36 = (number | null)
export type ArtifactId22 = string
export type ArtifactType23 = "scenario_definition"
export type ContentHash22 = string
export type ExperimentId24 = (string | null)
export type LogicalKey22 = string
export type FixtureLineageId1 = string
export type InitialState = ActualValue[]
export type AttributeRef10 = (string | null)
export type EventId = string
export type Seq1 = number
export type Tick37 = number
export type Value9 = (string | null)
export type Inputs1 = InputEvent[]
export type IsFixture1 = boolean
export type Label5 = string
export type ScenarioId1 = string
export type ServiceFunctionRefs = string[]
export type TickCount = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "VariantKind".
 */
export type VariantKind = ("BASELINE" | "RECOVERY")
export type Version11 = string
export type Revision23 = number
export type SchemaVersion22 = string
export type Tick38 = (number | null)
export type ArtifactId23 = string
export type ArtifactType24 = "source_register"
export type ContentHash23 = string
export type ExperimentId25 = (string | null)
export type LogicalKey23 = string
export type Revision24 = number
export type SchemaVersion23 = string
export type Tick39 = (number | null)
export type ArtifactId24 = string
export type ArtifactType25 = "sweep_run"
export type ContentHash24 = string
export type ExperimentId26 = (string | null)
export type LogicalKey24 = string
export type Revision25 = number
export type SchemaVersion24 = string
export type Tick40 = (number | null)
export type ArtifactId25 = string
export type ArtifactType26 = "target_definition"
export type ContentHash25 = string
export type ExperimentId27 = (string | null)
export type LogicalKey25 = string
export type AuthoredBy = string
export type GoalId1 = string
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GoalProperty".
 */
export type GoalProperty = ("RULE_SATISFIED" | "ATTRIBUTE_EQUALS" | "GAP_CLOSED")
export type RuleRef3 = (string | null)
export type SubjectRef = string
export type Value10 = (string | null)
export type Goals = TargetGoal[]
export type TargetId1 = string
export type Version12 = string
export type Revision26 = number
export type SchemaVersion25 = string
export type Tick41 = (number | null)
export type ArtifactId26 = string
export type ArtifactType27 = "topology_definition"
export type ContentHash26 = string
export type ExperimentId28 = (string | null)
export type LogicalKey26 = string
export type Revision27 = number
export type SchemaVersion26 = string
export type Tick42 = (number | null)
export type ArtifactId27 = string
export type ArtifactType28 = "weight_set"
export type ContentHash27 = string
export type ExperimentId29 = (string | null)
export type LogicalKey27 = string
export type Version13 = string
export type WeightSetId = string
export type AttributeRef11 = string
export type Weights = WeightEntry[]
export type Revision28 = number
export type SchemaVersion27 = string
export type Tick43 = (number | null)
export type Issue = string
export type Path = string
export type Details = ErrorDetail[]
export type ExperimentId30 = (string | null)
export type Message1 = string
export type Events = EventRecord[]
export type Seq2 = number
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StageName".
 */
export type StageName = ("DEFINITIONS" | "EMULATION" | "OBSERVATION" | "FORWARD" | "INVERSE" | "MERGE" | "STABILITY" | "EVALUATION" | "EXPORT")
export type Tick44 = (number | null)
export type StageEvents = StageEvent[]
export type Artifacts = (EnvelopeTopologyDefinition | EnvelopeImmutableTopology | EnvelopeGovernanceDefinition | EnvelopeAuthorityRecord | EnvelopeScenarioDefinition | EnvelopeConsistencyAnnotationSet | EnvelopeExperimentDefinition | EnvelopeActualState | EnvelopeEventRecord | EnvelopeObservationConfig | EnvelopeObservableTopology | EnvelopeObservableRules | EnvelopeSourceRegister | EnvelopeObservationBundle | EnvelopeObservationRecord | EnvelopeTargetDefinition | EnvelopeSweepRun | EnvelopeForwardResult | EnvelopeInverseResult | EnvelopeReconstructionResult | EnvelopeRecoveryProposal | EnvelopeRuleEvaluationSet | EnvelopeEvaluationReport | EnvelopeComparisonReport | EnvelopeWeightSet | EnvelopeOperatorRegistry | EnvelopeReplayReport)[]
export type BundleHash = string
export type BundleVersion = string
export type Events1 = EventRecord[]
export type ExperimentId31 = string
export type ArtifactId28 = string
export type ArtifactType29 = string
export type ContentHash28 = string
export type Manifest = ManifestEntry[]
export type StageEvents1 = StageEvent[]
export type ExperimentId32 = string
export type Label6 = string
export type ScenarioId2 = string
export type Status3 = string
export type Attempt3 = number
export type ComparisonId2 = (string | null)
export type DemoStep = (number | null)
export type ExperimentId33 = string
export type Filter = (string | null)
export type Focus = (string | null)
export type From2 = (number | null)
export type Lang = ("en" | "de")
export type Mode = ("standard" | "presentation")
export type Revision29 = (number | null)
export type Tick45 = number
export type To2 = (number | null)
export type ToTick6 = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ViewId".
 */
export type ViewId = ("SYSTEM_FIELD_OVERVIEW" | "TOPOLOGY_GRAPH" | "TEMPORAL_STATE_EXPLORER" | "OBSERVATION_INSPECTOR" | "FORWARD_SWEEP_INSPECTOR" | "INVERSE_SWEEP_INSPECTOR" | "STRUCTURAL_GAP_INSPECTOR" | "ARCHITECTURAL_CLOSURE_INSPECTOR" | "STRUCTURAL_METRICS" | "SCENARIO_COMPARISON" | "EVENT_TIMELINE")
export type Comparisons1 = string[]
export type Errors1 = ErrorRecord[]
export type ExperimentId34 = string
export type Label7 = string
export type StageStatus = StageStatus1[]
export type Attempt4 = number
export type Direction1 = string
export type SweepId2 = string
export type UpToTick3 = number
export type Sweeps = SweepSummary[]
export type First = number
export type Last = number
export type Experiments = ExperimentListEntry[]
export type CouplingsIn = FieldId[]
export type CouplingsOut = FieldId[]
export type Name1 = string
export type Package = string
export type Ports = string[]
export type Purpose = string
export type Reads = string[]
export type Requirements = string[]
export type StageStatus2 = [string, string][]
export type Stages = string[]
export type Writes = string[]
export type CouplingMatrix = Coupling[]
export type Manifests = FieldManifest[]
export type AppliesTo1 = string[]
export type Description1 = string
export type RuleId1 = string
export type Version14 = string
export type Rules2 = RuleView[]
export type Adapters = AdapterHealth[]
export type SchemaVersions = string[]
export type ServiceVersion = string
export type Status4 = string
export type ArtifactRefs = ArtifactRef[]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Lang".
 */
export type Lang1 = ("en" | "de")
export type Formula = string
export type Name2 = string
export type Relations3 = EvaluatedRelation[]
export type TickSet = string
export type Unit1 = string
export type Version15 = string
export type Definitions = MetricDefinition[]
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Mode".
 */
export type Mode1 = ("standard" | "presentation")
export type Attributes1 = string[]
export type Label8 = string
export type NodeId1 = string
export type NodeType1 = string
export type RelationId1 = string
export type Source3 = string
export type Target2 = string
export type ExperimentId35 = string
export type AuthorityRecords = AuthorityRecord[]
export type Proposals = RecoveryProposal[]
export type FixtureLineageId2 = string
export type IsFixture2 = boolean
export type Label9 = string
export type ObservationConfigs = string[]
export type ScenarioId3 = string
export type Targets = string[]
export type TickCount1 = number
export type VariantOf = (string | null)
export type Version16 = string
export type Scenarios = ScenarioEntry[]
export type Values3 = ActualValue[]
export type SweepIds = string[]
export type Nodes2 = NodeView[]
export type Relations4 = RelationView[]
export type RegistryLabels = [string, string][]
export type DataExperimentId = (string | null)
export type DataTick = (number | null)
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ViewStatus".
 */
export type ViewStatus = ("IDLE" | "LOADING" | "READY" | "VIEW_DATA_UNAVAILABLE")

export interface CiraContracts {
AChange?: AChange
AValueState?: AValueState
ActualState?: ActualState
ActualValue?: ActualValue
AdapterCapabilities?: AdapterCapabilities
AdapterDescriptor?: AdapterDescriptor
AdapterHealth?: AdapterHealth
AdapterKind?: AdapterKind
AdapterSelection?: AdapterSelection
Aggregation?: Aggregation
And?: And
Applicability?: Applicability
ApprovalRecord?: ApprovalRecord
ArtifactRef?: ArtifactRef
AssessmentStatus?: AssessmentStatus
AttributeChange?: AttributeChange
AttributeDecl?: AttributeDecl
AttributeMembership?: AttributeMembership
AuthorityRecord?: AuthorityRecord
Block_ForwardResult_?: BlockForwardResult
Block_InverseResult_?: BlockInverseResult
Block_ObservationProjectionBody_?: BlockObservationProjectionBody
Block_ReconstructionResult_?: BlockReconstructionResult
Block_RuleEvaluationSet_?: BlockRuleEvaluationSet
Block_SweepTrace_?: BlockSweepTrace
BudgetUsage?: BudgetUsage
BundleBudget?: BundleBudget
BundleDefinitions?: BundleDefinitions
CanonicalOperatorRef?: CanonicalOperatorRef
CaseSubset?: CaseSubset
ComparisonListEntry?: ComparisonListEntry
ComparisonReport?: ComparisonReport
ComparisonResponse?: ComparisonResponse
ComparisonsResponse?: ComparisonsResponse
ConfigurationSnapshot?: ConfigurationSnapshot
ConsistencyAnnotationSet?: ConsistencyAnnotationSet
ConsistencyCase?: ConsistencyCase
ContentAvailability?: ContentAvailability
ContentOpenness?: ContentOpenness
ContextBundle?: ContextBundle
Continuity?: Continuity
Coupling?: Coupling
CouplingChange?: CouplingChange
CouplingStatus?: CouplingStatus
CreatedResponse?: CreatedResponse
DataOrigin?: DataOrigin
Decision2?: Decision2
Decision3?: Decision3
DeltaCoupling?: DeltaCoupling
DeltaStateA?: DeltaStateA
DeltaStateO?: DeltaStateO
DeltaStateR?: DeltaStateR
EnvelopeActualState?: EnvelopeActualState
EnvelopeAuthorityRecord?: EnvelopeAuthorityRecord
EnvelopeComparisonReport?: EnvelopeComparisonReport
EnvelopeConsistencyAnnotationSet?: EnvelopeConsistencyAnnotationSet
EnvelopeEvaluationReport?: EnvelopeEvaluationReport
EnvelopeEventRecord?: EnvelopeEventRecord
EnvelopeExperimentDefinition?: EnvelopeExperimentDefinition
EnvelopeForwardResult?: EnvelopeForwardResult
EnvelopeGovernanceDefinition?: EnvelopeGovernanceDefinition
EnvelopeImmutableTopology?: EnvelopeImmutableTopology
EnvelopeInverseResult?: EnvelopeInverseResult
EnvelopeObservableRules?: EnvelopeObservableRules
EnvelopeObservableTopology?: EnvelopeObservableTopology
EnvelopeObservationBundle?: EnvelopeObservationBundle
EnvelopeObservationConfig?: EnvelopeObservationConfig
EnvelopeObservationRecord?: EnvelopeObservationRecord
EnvelopeOperatorRegistry?: EnvelopeOperatorRegistry
EnvelopeReconstructionResult?: EnvelopeReconstructionResult
EnvelopeRecoveryProposal?: EnvelopeRecoveryProposal
EnvelopeReplayReport?: EnvelopeReplayReport
EnvelopeRuleEvaluationSet?: EnvelopeRuleEvaluationSet
EnvelopeScenarioDefinition?: EnvelopeScenarioDefinition
EnvelopeSourceRegister?: EnvelopeSourceRegister
EnvelopeSweepRun?: EnvelopeSweepRun
EnvelopeTargetDefinition?: EnvelopeTargetDefinition
EnvelopeTopologyDefinition?: EnvelopeTopologyDefinition
EnvelopeWeightSet?: EnvelopeWeightSet
EpistemicClass?: EpistemicClass
Eq?: Eq
ErrorBody?: ErrorBody
ErrorCodeC?: ErrorCodeC
ErrorDetail?: ErrorDetail
ErrorRecord?: ErrorRecord
ErrorResponse?: ErrorResponse
EvalReason?: EvalReason
EvaluatedRelation?: EvaluatedRelation
EvaluationReport?: EvaluationReport
EventRecord?: EventRecord
EventStatus?: EventStatus
EventsProjection?: EventsProjection
ExecutionStatus?: ExecutionStatus
ExperimentBundle?: ExperimentBundle
ExperimentDefinition?: ExperimentDefinition
ExperimentListEntry?: ExperimentListEntry
ExperimentSession?: ExperimentSession
ExperimentView?: ExperimentView
ExperimentViewResponse?: ExperimentViewResponse
ExperimentsResponse?: ExperimentsResponse
ExternalOperatorRef?: ExternalOperatorRef
FieldId?: FieldId
FieldManifest?: FieldManifest
FieldsResponse?: FieldsResponse
ForwardResult?: ForwardResult
GapMatch?: GapMatch
GapStatus?: GapStatus
GoalProperty?: GoalProperty
GovernanceDefinition?: GovernanceDefinition
GovernanceProjection?: GovernanceProjection
GuardClass?: GuardClass
HealthResponse?: HealthResponse
IOperatorRef?: IOperatorRef
ImmutableTopology?: ImmutableTopology
Implies?: Implies
ImportCreated?: ImportCreated
In?: In
InputEvent?: InputEvent
InputEventKind?: InputEventKind
InverseResult?: InverseResult
Lang?: Lang1
Links?: Links
ManifestEntry?: ManifestEntry
MergeConflict?: MergeConflict
MergeRecord?: MergeRecord
MergeResolution?: MergeResolution
MetricAux?: MetricAux1
MetricConfig?: MetricConfig
MetricDefinition?: MetricDefinition
MetricId?: MetricId
MetricResult?: MetricResult
MetricStatus?: MetricStatus
MetricsProjection?: MetricsProjection
Mode?: Mode1
Node?: Node
NodeTypeDecl?: NodeTypeDecl
NodeView?: NodeView
Not?: Not
OChange?: OChange
OValueState?: OValueState
ObservableRules?: ObservableRules
ObservableTopologyDefinition?: ObservableTopologyDefinition
Observation?: Observation
ObservationBundle?: ObservationBundle
ObservationConfig?: ObservationConfig
ObservationProjection?: ObservationProjection
ObservationProjectionBody?: ObservationProjectionBody
ObservationRecord?: ObservationRecord
ObservationSource?: ObservationSource
ObservationStatus?: ObservationStatus
ObservationStrategy?: ObservationStrategy
OpenRelation?: OpenRelation
OperatorRegistry?: OperatorRegistry
Or?: Or
ProjectedValue?: ProjectedValue
ProjectionHeader?: ProjectionHeader
Provenance?: Provenance
QueryEcho?: QueryEcho1
RChange?: RChange
ROperatorRef?: ROperatorRef
RValueState?: RValueState
Rational?: Rational
ReconstructedValue?: ReconstructedValue
ReconstructionResult?: ReconstructionResult
ReconstructionStatus?: ReconstructionStatus
RecoveryAction?: RecoveryAction
RecoveryProposal?: RecoveryProposal
RecoveryVariantCreated?: RecoveryVariantCreated
ReferenceSpace?: ReferenceSpace1
ReferenceSpaceKind?: ReferenceSpaceKind
ReferenceStatus?: ReferenceStatus
RegistryCoupling?: RegistryCoupling
RegistryOperator?: RegistryOperator
RegistrySigma?: RegistrySigma
Relation?: Relation
RelationAssertion?: RelationAssertion
RelationType?: RelationType
RelationView?: RelationView
ReplayCreated?: ReplayCreated
ReplayMatch?: ReplayMatch
ReplayMode?: ReplayMode
ReplayReport?: ReplayReport
ReplayReportResponse?: ReplayReportResponse
ReplayVerdict?: ReplayVerdict
ResultsProjection?: ResultsProjection
RoleDecl?: RoleDecl
Rule?: Rule
RuleEvaluation?: RuleEvaluation
RuleEvaluationSet?: RuleEvaluationSet
RuleKind?: RuleKind
RuleResult?: RuleResult
RuleSummary?: RuleSummary
RuleView?: RuleView
ScenarioDefinition?: ScenarioDefinition
ScenarioEntry?: ScenarioEntry
ScenariosResponse?: ScenariosResponse
ScheduleMode?: ScheduleMode
SigmaRef?: SigmaRef
SourceReferenceRegister?: SourceReferenceRegister
SourceRegisterEntry?: SourceRegisterEntry
StabilityConfig?: StabilityConfig
StageEvent?: StageEvent
StageName?: StageName
StageStatus?: StageStatus1
StateProjection?: StateProjection
StateSpace?: StateSpace
StrategyRef?: StrategyRef
StructuralGap?: StructuralGap
SweepDirection?: SweepDirection
SweepOutput?: SweepOutput
SweepRun?: SweepRun
SweepSchedule?: SweepSchedule1
SweepSummary?: SweepSummary
SweepTrace?: SweepTrace
SweepsCreated?: SweepsCreated
SymbolPair?: SymbolPair
TargetAssessment?: TargetAssessment1
TargetDefinition?: TargetDefinition
TargetGoal?: TargetGoal
TerminationReason?: TerminationReason
TerminationRecord?: TerminationRecord
TickBounds?: TickBounds
TickRange?: TickRange
TimeIndex?: TimeIndex
TopologyDefinition?: TopologyDefinition
TopologyProjection?: TopologyProjection
TopologyProjectionBody?: TopologyProjectionBody
TraceProjection?: TraceProjection
TraceStep?: TraceStep
TransitionIn?: TransitionIn
UndefinedReason?: UndefinedReason
ValueDomain?: ValueDomain
VariantKind?: VariantKind
Verdict?: Verdict
ViewId?: ViewId
ViewState?: ViewState
ViewStatus?: ViewStatus
WeightEntry?: WeightEntry
WeightSet?: WeightSet
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AChange".
 */
export interface AChange {
after: AValueState
attribute_ref: AttributeRef
before: AValueState
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AValueState".
 */
export interface AValueState {
applicability: Applicability
value: Value
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ActualState".
 */
export interface ActualState {
last_seq: LastSeq
scenario_ref: ArtifactRef
tick: Tick
values: Values
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ArtifactRef".
 */
export interface ArtifactRef {
artifact_id: ArtifactId
artifact_type: ArtifactType
content_hash: ContentHash
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ActualValue".
 */
export interface ActualValue {
applicability: Applicability
attribute_ref: AttributeRef1
value: Value1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AdapterCapabilities".
 */
export interface AdapterCapabilities {
forward: Forward
inverse: Inverse
merge: Merge
trace: Trace
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AdapterDescriptor".
 */
export interface AdapterDescriptor {
adapter_id: AdapterId
adapter_version: AdapterVersion
capabilities: AdapterCapabilities
engine_version: EngineVersion
is_fixture: IsFixture
kind: AdapterKind
operator_registry_ref: (ArtifactRef | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AdapterHealth".
 */
export interface AdapterHealth {
available: Available
descriptor: AdapterDescriptor
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AdapterSelection".
 */
export interface AdapterSelection {
config_ref: ConfigRef
kind: AdapterKind
merge_policy: StrategyRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StrategyRef".
 */
export interface StrategyRef {
point: Point
variant: Variant
version: Version
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "And".
 */
export interface And {
args: Args
op: Op6
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Eq".
 */
export interface Eq {
at: (TimeIndex | null)
attr: Attr
op: Op
value: Value2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "In".
 */
export interface In {
at: (TimeIndex | null)
attr: Attr1
op: Op1
values: Values1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Not".
 */
export interface Not {
arg: Arg
op: Op5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Or".
 */
export interface Or {
args: Args1
op: Op4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Implies".
 */
export interface Implies {
if: If
op: Op3
then: Then
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TransitionIn".
 */
export interface TransitionIn {
allowed: Allowed
attr: Attr2
op: Op2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SymbolPair".
 */
export interface SymbolPair {
from: From
to: To
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ApprovalRecord".
 */
export interface ApprovalRecord {
approval_id: ApprovalId
decision: Decision3
rationale: Rationale
role_ref: RoleRef
rule_ref: RuleRef
subject_refs: SubjectRefs
tick: Tick1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AttributeChange".
 */
export interface AttributeChange {
after: After
attribute_ref: AttributeRef2
before: Before
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AttributeDecl".
 */
export interface AttributeDecl {
applicability: Applicability
attribute_id: AttributeId
domain_ref: DomainRef
name: Name
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AttributeMembership".
 */
export interface AttributeMembership {
attribute_ref: AttributeRef3
delta: Delta
in_d_det: InDDet
in_d_obs: InDObs
in_d_ref: InDRef
tick: Tick2
weight: Rational
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Rational".
 */
export interface Rational {
d: D
n: N
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "AuthorityRecord".
 */
export interface AuthorityRecord {
created_scenario_ref: (ArtifactRef | null)
decision: Decision2
decision_id: DecisionId
proposal_ref: ArtifactRef
rationale: Rationale1
role_ref: RoleRef1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_ForwardResult_".
 */
export interface BlockForwardResult {
availability: ContentAvailability
content: (ForwardResult | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ForwardResult".
 */
export interface ForwardResult {
output: SweepOutput
sweep: SweepRun
trace: SweepTrace
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepOutput".
 */
export interface SweepOutput {
gaps: Gaps
open_relations: OpenRelations
relations: Relations
values: Values2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StructuralGap".
 */
export interface StructuralGap {
epistemic_class: EpistemicClass
gap_id: GapId
kind: Kind
source_refs: SourceRefs
status: GapStatus
subject_refs: SubjectRefs1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "OpenRelation".
 */
export interface OpenRelation {
reason: Reason
reference_status: ReferenceStatus
relation_key: RelationKey
subject_refs: SubjectRefs2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RelationAssertion".
 */
export interface RelationAssertion {
coupling_status: CouplingStatus
derived_from: DerivedFrom
epistemic_class: EpistemicClass
relation_key: RelationKey1
relation_type: (RelationType | null)
source: Source
target: Target
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReconstructedValue".
 */
export interface ReconstructedValue {
attribute_ref: AttributeRef4
derived_from: DerivedFrom1
epistemic_class: (EpistemicClass | null)
reference_status: ReferenceStatus1
status: ReconstructionStatus
value: Value3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepRun".
 */
export interface SweepRun {
adapter: AdapterDescriptor
attempt: Attempt
context_version: ContextVersion
direction: SweepDirection
error: (ErrorRecord | null)
execution_status: ExecutionStatus
input_bundle_ref: ArtifactRef
sweep_id: SweepId
target_ref: (ArtifactRef | null)
termination: (TerminationRecord | null)
up_to_tick: UpToTick
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ErrorRecord".
 */
export interface ErrorRecord {
code: ErrorCodeC
field: FieldId
message: Message
recovery: RecoveryAction
subject_refs: SubjectRefs3
tick: Tick3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TerminationRecord".
 */
export interface TerminationRecord {
budget: Budget
engine_message: EngineMessage
last_step_seq: LastStepSeq
reason: TerminationReason
steps_executed: StepsExecuted
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepTrace".
 */
export interface SweepTrace {
reference_status: ReferenceStatus
steps: Steps
sweep_id: SweepId1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TraceStep".
 */
export interface TraceStep {
engine_note: EngineNote
epistemic_class: EpistemicClass
input_refs: InputRefs
operator_ref: OperatorRef
output_refs: OutputRefs
sigma_ref: (SigmaRef | null)
step_id: StepId
step_seq: StepSeq
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "CanonicalOperatorRef".
 */
export interface CanonicalOperatorRef {
namespace: Namespace
registry_version: RegistryVersion
symbol: Symbol
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ROperatorRef".
 */
export interface ROperatorRef {
code: Code
namespace: Namespace1
registry_version: RegistryVersion1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "IOperatorRef".
 */
export interface IOperatorRef {
code: Code1
namespace: Namespace2
registry_version: RegistryVersion2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExternalOperatorRef".
 */
export interface ExternalOperatorRef {
code: Code2
namespace: Namespace3
registry_version: RegistryVersion3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SigmaRef".
 */
export interface SigmaRef {
registry_version: RegistryVersion4
sigma_id: SigmaId
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_InverseResult_".
 */
export interface BlockInverseResult {
availability: ContentAvailability
content: (InverseResult | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "InverseResult".
 */
export interface InverseResult {
output: SweepOutput
sweep: SweepRun
target_assessment: TargetAssessment
trace: SweepTrace
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TargetAssessment".
 */
export interface TargetAssessment1 {
derived_from: DerivedFrom2
goal_id: GoalId
status: AssessmentStatus
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_ObservationProjectionBody_".
 */
export interface BlockObservationProjectionBody {
availability: ContentAvailability
content: (ObservationProjectionBody | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationProjectionBody".
 */
export interface ObservationProjectionBody {
budget_usage: BudgetUsage
bundle_budget: BundleBudget
context: ContextBundle
delta: (DeltaStateO | null)
projected: Projected
revision: Revision
serialization_profile: SerializationProfile
source_register: SourceReferenceRegister
visible_nodes: VisibleNodes
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "BudgetUsage".
 */
export interface BudgetUsage {
bytes: Bytes
observations: Observations
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "BundleBudget".
 */
export interface BundleBudget {
max_bytes: MaxBytes
max_observations: MaxObservations
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ContextBundle".
 */
export interface ContextBundle {
context_version: ContextVersion1
observations: Observations1
previous_context_ref: PreviousContextRef
sequence: Sequence
tick: Tick5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Observation".
 */
export interface Observation {
attribute_ref: AttributeRef5
observation_id: ObservationId
observed_at_tick: ObservedAtTick
references: References
source_id: SourceId
status: ObservationStatus
tick: Tick4
value: Value4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "DeltaStateO".
 */
export interface DeltaStateO {
changes: Changes
from_tick: FromTick
space: Space
to_tick: ToTick
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "OChange".
 */
export interface OChange {
after: OValueState
attribute_ref: AttributeRef6
before: OValueState
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "OValueState".
 */
export interface OValueState {
status: ObservationStatus
value: Value5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ProjectedValue".
 */
export interface ProjectedValue {
attribute_ref: AttributeRef7
observed_at_tick: ObservedAtTick1
source_id: SourceId1
stale: Stale
status: ObservationStatus
value: Value6
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SourceReferenceRegister".
 */
export interface SourceReferenceRegister {
entries: Entries
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SourceRegisterEntry".
 */
export interface SourceRegisterEntry {
continuity: Continuity
first_tick: FirstTick
gaps: Gaps1
last_tick: LastTick
source_id: SourceId2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TickRange".
 */
export interface TickRange {
from_tick: FromTick1
to_tick: ToTick1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_ReconstructionResult_".
 */
export interface BlockReconstructionResult {
availability: ContentAvailability
content: (ReconstructionResult | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReconstructionResult".
 */
export interface ReconstructionResult {
attempt: Attempt1
context_version: ContextVersion2
delta_coupling: (DeltaCoupling | null)
delta_state: (DeltaStateR | null)
merge: MergeRecord
openness: ContentOpenness
output: SweepOutput
previous_reconstruction_ref: (ArtifactRef | null)
reconstruction_id: ReconstructionId
up_to_tick: UpToTick1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "DeltaCoupling".
 */
export interface DeltaCoupling {
changes: Changes1
from_tick: FromTick2
to_tick: ToTick2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "CouplingChange".
 */
export interface CouplingChange {
after: After1
before: Before1
relation_key: RelationKey2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "DeltaStateR".
 */
export interface DeltaStateR {
changes: Changes2
from_tick: FromTick3
space: Space1
to_tick: ToTick3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RChange".
 */
export interface RChange {
after: RValueState
attribute_ref: AttributeRef8
before: RValueState
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RValueState".
 */
export interface RValueState {
status: Status
value: Value7
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MergeRecord".
 */
export interface MergeRecord {
conflicts: Conflicts
engine_merged: EngineMerged
forward_ref: ArtifactRef
inverse_ref: ArtifactRef
policy: StrategyRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MergeConflict".
 */
export interface MergeConflict {
attribute_ref: AttributeRef9
forward: Forward1
inverse: Inverse1
resolution: MergeResolution
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ContentOpenness".
 */
export interface ContentOpenness {
open_references: OpenReferences
open_relations: OpenRelations1
structural_gaps_open: StructuralGapsOpen
undetermined: Undetermined
unevaluable_rules: UnevaluableRules
unknown_observations: UnknownObservations
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_RuleEvaluationSet_".
 */
export interface BlockRuleEvaluationSet {
availability: ContentAvailability
content: (RuleEvaluationSet | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleEvaluationSet".
 */
export interface RuleEvaluationSet {
evaluations: Evaluations
governance_ref: ArtifactRef
not_in_validity: NotInValidity
space: StateSpace
summary: RuleSummary
tick: Tick7
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleEvaluation".
 */
export interface RuleEvaluation {
input_attribute_refs: InputAttributeRefs
reason: EvalReason
result: RuleResult
rule_ref: RuleRef1
rule_version: RuleVersion
space: StateSpace
tick: Tick6
tick_to: TickTo
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleSummary".
 */
export interface RuleSummary {
false: False
not_in_validity: NotInValidity1
true: True
unevaluable: Unevaluable
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Block_SweepTrace_".
 */
export interface BlockSweepTrace {
availability: ContentAvailability
content: (SweepTrace | null)
origin: (DataOrigin | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "BundleDefinitions".
 */
export interface BundleDefinitions {
annotations: (ArtifactRef | null)
experiment_definition: ArtifactRef
governance: ArtifactRef
observation_config: ArtifactRef
operator_registry: (ArtifactRef | null)
scenario: ArtifactRef
target: ArtifactRef
topology: ArtifactRef
weight_set: ArtifactRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ComparisonListEntry".
 */
export interface ComparisonListEntry {
baseline: Baseline
comparison_id: ComparisonId
comparison_tick: ComparisonTick
compatible: Compatible
recovery: Recovery
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ComparisonReport".
 */
export interface ComparisonReport {
baseline_experiment_id: BaselineExperimentId
basis: StrategyRef
comparison_key: ComparisonKey
comparison_tick: ComparisonTick1
compatible: Compatible1
fixture_lineage_id: FixtureLineageId
incompatibility: Incompatibility
new: New
original: Original
persisting: Persisting
recovery_experiment_id: RecoveryExperimentId
resolved: Resolved
results: Results
unevaluable_in_recovery: UnevaluableInRecovery1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricResult".
 */
export interface MetricResult {
aggregation: Aggregation
aux: MetricAux
case_subset: (CaseSubset | null)
denominator: (Rational | null)
metric_id: MetricId
numerator: (Rational | null)
reference_space: ReferenceSpace
relation: EvaluatedRelation
status: MetricStatus
tick: Tick8
undefined_reason: (UndefinedReason | null)
unit: Unit
value: Value8
version: Version1
}
export interface MetricAux {
fn: Fn
fp: Fp
function_ref: FunctionRef
hypotheses_excluded: HypothesesExcluded
new_inconsistencies: NewInconsistencies
not_applicable_excluded: NotApplicableExcluded
not_in_validity: NotInValidity2
observable_cases: ObservableCases
persisting: Persisting1
shared_coverage: (Rational | null)
shared_coverage_undefined: SharedCoverageUndefined
stale_known: StaleKnown
ticks_excluded: TicksExcluded
ticks_included: TicksIncluded
tp: Tp
undetermined_count: UndeterminedCount
unevaluable_count: UnevaluableCount
unevaluable_in_recovery: UnevaluableInRecovery
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ComparisonResponse".
 */
export interface ComparisonResponse {
comparison: ComparisonReport
header: ProjectionHeader
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ProjectionHeader".
 */
export interface ProjectionHeader {
data_origin: DataOrigin
experiment_id: ExperimentId
guard_class: GuardClass
query_echo: QueryEcho
schema_version: SchemaVersion
source_refs: SourceRefs1
tick: Tick9
}
export interface QueryEcho {
aggregation: (Aggregation | null)
attempt: Attempt2
comparison_id: ComparisonId1
direction: Direction
from: From1
revision: Revision1
to: To1
to_tick: ToTick4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ComparisonsResponse".
 */
export interface ComparisonsResponse {
comparisons: Comparisons
header: ProjectionHeader
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ConfigurationSnapshot".
 */
export interface ConfigurationSnapshot {
adapter_kind: AdapterKind
experiment_id: ExperimentId1
observation_config_id: ObservationConfigId
scenario_id: ScenarioId
strategies: Strategies
sweep_schedule: SweepSchedule
target_id: TargetId
tick: Tick10
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ConsistencyAnnotationSet".
 */
export interface ConsistencyAnnotationSet {
cases: Cases
scenario_ref: ArtifactRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ConsistencyCase".
 */
export interface ConsistencyCase {
case_id: CaseId
kind: Kind1
rule_ref: RuleRef2
subject_refs: SubjectRefs4
tick_from: TickFrom
tick_to: TickTo1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Coupling".
 */
export interface Coupling {
carrier: Carrier
source: FieldId
target: FieldId
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "CreatedResponse".
 */
export interface CreatedResponse {
experiment_id: ExperimentId2
links: Links
status: Status1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Links".
 */
export interface Links {
self: Self
view: View
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "DeltaStateA".
 */
export interface DeltaStateA {
changes: Changes3
from_tick: FromTick4
space: Space2
to_tick: ToTick5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeActualState".
 */
export interface EnvelopeActualState {
artifact_id: ArtifactId1
artifact_type: ArtifactType1
content_hash: ContentHash1
experiment_id: ExperimentId3
logical_key: LogicalKey
payload: ActualState
provenance: Provenance
revision: Revision2
schema_version: SchemaVersion1
tick: Tick11
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Provenance".
 */
export interface Provenance {
data_origin: DataOrigin
producer_id: ProducerId
producer_version: ProducerVersion
source_field: FieldId
source_refs: SourceRefs2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeAuthorityRecord".
 */
export interface EnvelopeAuthorityRecord {
artifact_id: ArtifactId2
artifact_type: ArtifactType2
content_hash: ContentHash2
experiment_id: ExperimentId4
logical_key: LogicalKey1
payload: AuthorityRecord
provenance: Provenance
revision: Revision3
schema_version: SchemaVersion2
tick: Tick12
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeComparisonReport".
 */
export interface EnvelopeComparisonReport {
artifact_id: ArtifactId3
artifact_type: ArtifactType3
content_hash: ContentHash3
experiment_id: ExperimentId5
logical_key: LogicalKey2
payload: ComparisonReport
provenance: Provenance
revision: Revision4
schema_version: SchemaVersion3
tick: Tick13
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeConsistencyAnnotationSet".
 */
export interface EnvelopeConsistencyAnnotationSet {
artifact_id: ArtifactId4
artifact_type: ArtifactType4
content_hash: ContentHash4
experiment_id: ExperimentId6
logical_key: LogicalKey3
payload: ConsistencyAnnotationSet
provenance: Provenance
revision: Revision5
schema_version: SchemaVersion4
tick: Tick14
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeEvaluationReport".
 */
export interface EnvelopeEvaluationReport {
artifact_id: ArtifactId5
artifact_type: ArtifactType5
content_hash: ContentHash5
experiment_id: ExperimentId7
logical_key: LogicalKey4
payload: EvaluationReport
provenance: Provenance
revision: Revision6
schema_version: SchemaVersion5
tick: Tick17
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EvaluationReport".
 */
export interface EvaluationReport {
attribute_membership: AttributeMembership1
data_origin: DataOrigin
errors: Errors
execution_status: ExecutionStatus
gap_matches: GapMatches
inputs: Inputs
reference_spaces: ReferenceSpaces
report_key: ReportKey
results: Results1
rule_evaluations: RuleEvaluations
strategies: Strategies1
version: Version2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GapMatch".
 */
export interface GapMatch {
case_id: CaseId1
class_key: ClassKey
gap_id: GapId1
matcher: StrategyRef
observable: Observable
tick: Tick15
verdict: Verdict
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReferenceSpace".
 */
export interface ReferenceSpace1 {
kind: ReferenceSpaceKind
members: Members
reference_space_id: ReferenceSpaceId
space_hash: SpaceHash
tick: Tick16
weight_set_ref: WeightSetRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeEventRecord".
 */
export interface EnvelopeEventRecord {
artifact_id: ArtifactId6
artifact_type: ArtifactType6
content_hash: ContentHash6
experiment_id: ExperimentId8
logical_key: LogicalKey5
payload: EventRecord
provenance: Provenance
revision: Revision7
schema_version: SchemaVersion6
tick: Tick19
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EventRecord".
 */
export interface EventRecord {
effects: Effects
error: (ErrorRecord | null)
event_ref: EventRef
kind: InputEventKind
seq: Seq
status: EventStatus
tick: Tick18
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeExperimentDefinition".
 */
export interface EnvelopeExperimentDefinition {
artifact_id: ArtifactId7
artifact_type: ArtifactType7
content_hash: ContentHash7
experiment_id: ExperimentId9
logical_key: LogicalKey6
payload: ExperimentDefinition
provenance: Provenance
revision: Revision8
schema_version: SchemaVersion7
tick: Tick21
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentDefinition".
 */
export interface ExperimentDefinition {
adapter: AdapterSelection
definition_version: DefinitionVersion
label: Label
metric_config: MetricConfig
observation_config_ref: ArtifactRef
observation_strategy: ObservationStrategy
replay_mode: (ReplayMode | null)
replay_of: ReplayOf
scenario_ref: ArtifactRef
stability: StabilityConfig
sweep_schedule: SweepSchedule1
target_definition_ref: ArtifactRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricConfig".
 */
export interface MetricConfig {
closure_basis: StrategyRef
comparison_tick: ComparisonTick2
coverage_weighting: StrategyRef
gap_matcher: StrategyRef
hypothesis_policy: StrategyRef
service_function_spaces: StrategyRef
stability_source: StrategyRef
weight_set_ref: WeightSetRef1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationStrategy".
 */
export interface ObservationStrategy {
budget_unit: StrategyRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StabilityConfig".
 */
export interface StabilityConfig {
enabled: Enabled
tick: Tick20
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepSchedule".
 */
export interface SweepSchedule1 {
mode: ScheduleMode
ticks: Ticks
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeForwardResult".
 */
export interface EnvelopeForwardResult {
artifact_id: ArtifactId8
artifact_type: ArtifactType8
content_hash: ContentHash8
experiment_id: ExperimentId10
logical_key: LogicalKey7
payload: ForwardResult
provenance: Provenance
revision: Revision9
schema_version: SchemaVersion8
tick: Tick22
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeGovernanceDefinition".
 */
export interface EnvelopeGovernanceDefinition {
artifact_id: ArtifactId9
artifact_type: ArtifactType9
content_hash: ContentHash9
experiment_id: ExperimentId11
logical_key: LogicalKey8
payload: GovernanceDefinition
provenance: Provenance
revision: Revision10
schema_version: SchemaVersion9
tick: Tick23
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GovernanceDefinition".
 */
export interface GovernanceDefinition {
governance_id: GovernanceId
roles: Roles
rules: Rules
topology_ref: ArtifactRef
version: Version4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RoleDecl".
 */
export interface RoleDecl {
label: Label1
role_id: RoleId
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Rule".
 */
export interface Rule {
applies_to: AppliesTo
description: Description
expression: Expression
kind: RuleKind
permits: Permits
requires: Requires
rule_id: RuleId
scope: Scope
valid_from_tick: ValidFromTick
valid_until_tick: ValidUntilTick
version: Version3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeImmutableTopology".
 */
export interface EnvelopeImmutableTopology {
artifact_id: ArtifactId10
artifact_type: ArtifactType10
content_hash: ContentHash10
experiment_id: ExperimentId12
logical_key: LogicalKey9
payload: ImmutableTopology
provenance: Provenance
revision: Revision11
schema_version: SchemaVersion10
tick: Tick24
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ImmutableTopology".
 */
export interface ImmutableTopology {
attribute_universe: AttributeUniverse
definition: TopologyDefinition
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TopologyDefinition".
 */
export interface TopologyDefinition {
node_types: NodeTypes
nodes: Nodes
relations: Relations1
topology_id: TopologyId
value_domains: ValueDomains
version: Version8
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "NodeTypeDecl".
 */
export interface NodeTypeDecl {
label: Label2
type_id: TypeId
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Node".
 */
export interface Node {
attributes: Attributes
label: Label3
node_id: NodeId
node_type: NodeType
version: Version5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "Relation".
 */
export interface Relation {
relation_id: RelationId
relation_type: RelationType
source: Source1
target: Target1
version: Version6
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ValueDomain".
 */
export interface ValueDomain {
domain_id: DomainId
symbols: Symbols
version: Version7
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeInverseResult".
 */
export interface EnvelopeInverseResult {
artifact_id: ArtifactId11
artifact_type: ArtifactType11
content_hash: ContentHash11
experiment_id: ExperimentId13
logical_key: LogicalKey10
payload: InverseResult
provenance: Provenance
revision: Revision12
schema_version: SchemaVersion11
tick: Tick25
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeObservableRules".
 */
export interface EnvelopeObservableRules {
artifact_id: ArtifactId12
artifact_type: ArtifactType12
content_hash: ContentHash12
experiment_id: ExperimentId14
logical_key: LogicalKey11
payload: ObservableRules
provenance: Provenance
revision: Revision13
schema_version: SchemaVersion12
tick: Tick26
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservableRules".
 */
export interface ObservableRules {
rules: Rules1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeObservableTopology".
 */
export interface EnvelopeObservableTopology {
artifact_id: ArtifactId13
artifact_type: ArtifactType13
content_hash: ContentHash13
experiment_id: ExperimentId15
logical_key: LogicalKey12
payload: ObservableTopologyDefinition
provenance: Provenance
revision: Revision14
schema_version: SchemaVersion13
tick: Tick27
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservableTopologyDefinition".
 */
export interface ObservableTopologyDefinition {
nodes: Nodes1
relations: Relations2
value_domains: ValueDomains1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeObservationBundle".
 */
export interface EnvelopeObservationBundle {
artifact_id: ArtifactId14
artifact_type: ArtifactType14
content_hash: ContentHash14
experiment_id: ExperimentId16
logical_key: LogicalKey13
payload: ObservationBundle
provenance: Provenance
revision: Revision15
schema_version: SchemaVersion14
tick: Tick28
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationBundle".
 */
export interface ObservationBundle {
budget_usage: BudgetUsage
bundle_key: BundleKey
contexts: Contexts
observable_rules: ObservableRules
observable_topology: ObservableTopologyDefinition
serialization_profile: SerializationProfile1
source_register: SourceReferenceRegister
up_to_tick: UpToTick2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeObservationConfig".
 */
export interface EnvelopeObservationConfig {
artifact_id: ArtifactId15
artifact_type: ArtifactType15
content_hash: ContentHash15
experiment_id: ExperimentId17
logical_key: LogicalKey14
payload: ObservationConfig
provenance: Provenance
revision: Revision16
schema_version: SchemaVersion15
tick: Tick29
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationConfig".
 */
export interface ObservationConfig {
bundle_budget: BundleBudget
config_id: ConfigId
serialization_profiles: SerializationProfiles
sources: Sources
version: Version9
visible_nodes: VisibleNodes1
visible_relations: VisibleRelations
visible_rules: VisibleRules
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationSource".
 */
export interface ObservationSource {
active: Active
label: Label4
lag_ticks: LagTicks
observes: Observes
source_id: SourceId3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeObservationRecord".
 */
export interface EnvelopeObservationRecord {
artifact_id: ArtifactId16
artifact_type: ArtifactType16
content_hash: ContentHash16
experiment_id: ExperimentId18
logical_key: LogicalKey15
payload: ObservationRecord
provenance: Provenance
revision: Revision17
schema_version: SchemaVersion16
tick: Tick31
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationRecord".
 */
export interface ObservationRecord {
actual_state_refs: ActualStateRefs
bundle_ref: ArtifactRef
observation_config_ref: ArtifactRef
tick: Tick30
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeOperatorRegistry".
 */
export interface EnvelopeOperatorRegistry {
artifact_id: ArtifactId17
artifact_type: ArtifactType17
content_hash: ContentHash17
experiment_id: ExperimentId19
logical_key: LogicalKey16
payload: OperatorRegistry
provenance: Provenance
revision: Revision18
schema_version: SchemaVersion17
tick: Tick32
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "OperatorRegistry".
 */
export interface OperatorRegistry {
operators: Operators
registry_id: RegistryId
sigma_couplings: SigmaCouplings
sigma_fields: SigmaFields
source: Source2
version: Version10
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RegistryOperator".
 */
export interface RegistryOperator {
description_from_source: DescriptionFromSource
label_from_source: LabelFromSource
ref: Ref
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RegistryCoupling".
 */
export interface RegistryCoupling {
operator: Operator
relation_label_from_source: RelationLabelFromSource
source: SigmaRef
target: (SigmaRef | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RegistrySigma".
 */
export interface RegistrySigma {
label_from_source: LabelFromSource1
ref: SigmaRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeReconstructionResult".
 */
export interface EnvelopeReconstructionResult {
artifact_id: ArtifactId18
artifact_type: ArtifactType18
content_hash: ContentHash18
experiment_id: ExperimentId20
logical_key: LogicalKey17
payload: ReconstructionResult
provenance: Provenance
revision: Revision19
schema_version: SchemaVersion18
tick: Tick33
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeRecoveryProposal".
 */
export interface EnvelopeRecoveryProposal {
artifact_id: ArtifactId19
artifact_type: ArtifactType19
content_hash: ContentHash19
experiment_id: ExperimentId21
logical_key: LogicalKey18
payload: RecoveryProposal
provenance: Provenance
revision: Revision20
schema_version: SchemaVersion19
tick: Tick34
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RecoveryProposal".
 */
export interface RecoveryProposal {
description_from_engine: DescriptionFromEngine
proposal_id: ProposalId
reconstruction_ref: ArtifactRef
status: Status2
subject_refs: SubjectRefs5
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeReplayReport".
 */
export interface EnvelopeReplayReport {
artifact_id: ArtifactId20
artifact_type: ArtifactType20
content_hash: ContentHash20
experiment_id: ExperimentId22
logical_key: LogicalKey19
payload: ReplayReport
provenance: Provenance
revision: Revision21
schema_version: SchemaVersion20
tick: Tick35
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayReport".
 */
export interface ReplayReport {
compared_types: ComparedTypes
matches: Matches
mode: ReplayMode
original_experiment_id: OriginalExperimentId
replay_experiment_id: ReplayExperimentId
verdict: ReplayVerdict
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayMatch".
 */
export interface ReplayMatch {
artifact_type: ArtifactType21
equal: Equal
logical_key: LogicalKey20
original_id: OriginalId
replay_id: ReplayId
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeRuleEvaluationSet".
 */
export interface EnvelopeRuleEvaluationSet {
artifact_id: ArtifactId21
artifact_type: ArtifactType22
content_hash: ContentHash21
experiment_id: ExperimentId23
logical_key: LogicalKey21
payload: RuleEvaluationSet
provenance: Provenance
revision: Revision22
schema_version: SchemaVersion21
tick: Tick36
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeScenarioDefinition".
 */
export interface EnvelopeScenarioDefinition {
artifact_id: ArtifactId22
artifact_type: ArtifactType23
content_hash: ContentHash22
experiment_id: ExperimentId24
logical_key: LogicalKey22
payload: ScenarioDefinition
provenance: Provenance
revision: Revision23
schema_version: SchemaVersion22
tick: Tick38
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ScenarioDefinition".
 */
export interface ScenarioDefinition {
authority_ref: (ArtifactRef | null)
derived_from_proposal: (ArtifactRef | null)
fixture_lineage_id: FixtureLineageId1
governance_ref: ArtifactRef
initial_state: InitialState
inputs: Inputs1
is_fixture: IsFixture1
label: Label5
scenario_id: ScenarioId1
service_function_refs: ServiceFunctionRefs
tick_count: TickCount
topology_ref: ArtifactRef
variant_kind: VariantKind
variant_of: (ArtifactRef | null)
version: Version11
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "InputEvent".
 */
export interface InputEvent {
approval: (ApprovalRecord | null)
attribute_ref: AttributeRef10
event_id: EventId
kind: InputEventKind
seq: Seq1
tick: Tick37
value: Value9
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeSourceRegister".
 */
export interface EnvelopeSourceRegister {
artifact_id: ArtifactId23
artifact_type: ArtifactType24
content_hash: ContentHash23
experiment_id: ExperimentId25
logical_key: LogicalKey23
payload: SourceReferenceRegister
provenance: Provenance
revision: Revision24
schema_version: SchemaVersion23
tick: Tick39
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeSweepRun".
 */
export interface EnvelopeSweepRun {
artifact_id: ArtifactId24
artifact_type: ArtifactType25
content_hash: ContentHash24
experiment_id: ExperimentId26
logical_key: LogicalKey24
payload: SweepRun
provenance: Provenance
revision: Revision25
schema_version: SchemaVersion24
tick: Tick40
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeTargetDefinition".
 */
export interface EnvelopeTargetDefinition {
artifact_id: ArtifactId25
artifact_type: ArtifactType26
content_hash: ContentHash25
experiment_id: ExperimentId27
logical_key: LogicalKey25
payload: TargetDefinition
provenance: Provenance
revision: Revision26
schema_version: SchemaVersion25
tick: Tick41
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TargetDefinition".
 */
export interface TargetDefinition {
authored_by: AuthoredBy
goals: Goals
target_id: TargetId1
version: Version12
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TargetGoal".
 */
export interface TargetGoal {
goal_id: GoalId1
property: GoalProperty
rule_ref: RuleRef3
subject_ref: SubjectRef
value: Value10
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeTopologyDefinition".
 */
export interface EnvelopeTopologyDefinition {
artifact_id: ArtifactId26
artifact_type: ArtifactType27
content_hash: ContentHash26
experiment_id: ExperimentId28
logical_key: LogicalKey26
payload: TopologyDefinition
provenance: Provenance
revision: Revision27
schema_version: SchemaVersion26
tick: Tick42
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EnvelopeWeightSet".
 */
export interface EnvelopeWeightSet {
artifact_id: ArtifactId27
artifact_type: ArtifactType28
content_hash: ContentHash27
experiment_id: ExperimentId29
logical_key: LogicalKey27
payload: WeightSet
provenance: Provenance
revision: Revision28
schema_version: SchemaVersion27
tick: Tick43
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "WeightSet".
 */
export interface WeightSet {
default_weight: Rational1
version: Version13
weight_set_id: WeightSetId
weights: Weights
}
export interface Rational1 {
d: D
n: N
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "WeightEntry".
 */
export interface WeightEntry {
attribute_ref: AttributeRef11
weight: Rational
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ErrorBody".
 */
export interface ErrorBody {
code: ErrorCodeC
details: Details
experiment_id: ExperimentId30
field: (FieldId | null)
message: Message1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ErrorDetail".
 */
export interface ErrorDetail {
issue: Issue
path: Path
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ErrorResponse".
 */
export interface ErrorResponse {
error: ErrorBody
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "EventsProjection".
 */
export interface EventsProjection {
events: Events
header: ProjectionHeader
stage_events: StageEvents
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StageEvent".
 */
export interface StageEvent {
error: (ErrorRecord | null)
seq: Seq2
stage: StageName
status: ExecutionStatus
tick: Tick44
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentBundle".
 */
export interface ExperimentBundle {
artifacts: Artifacts
bundle_hash: BundleHash
bundle_version: BundleVersion
definitions: BundleDefinitions
events: Events1
experiment_id: ExperimentId31
manifest: Manifest
stage_events: StageEvents1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ManifestEntry".
 */
export interface ManifestEntry {
artifact_id: ArtifactId28
artifact_type: ArtifactType29
content_hash: ContentHash28
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentListEntry".
 */
export interface ExperimentListEntry {
data_origin: DataOrigin
experiment_id: ExperimentId32
label: Label6
scenario_id: ScenarioId2
status: Status3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentSession".
 */
export interface ExperimentSession {
aggregation: (Aggregation | null)
attempt: Attempt3
comparison_id: ComparisonId2
demo_step: DemoStep
experiment_id: ExperimentId33
filter: Filter
focus: Focus
from: From2
lang: Lang
mode: Mode
revision: Revision29
tick: Tick45
to: To2
to_tick: ToTick6
view: ViewId
}
/**
 * Projection from StageEvents (K-35), not an artifact; fields from label on: K-59.
 * 
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentView".
 */
export interface ExperimentView {
comparisons: Comparisons1
data_origin: DataOrigin
definition_ref: ArtifactRef
errors: Errors1
experiment_id: ExperimentId34
label: Label7
openness: ContentOpenness
stage_status: StageStatus
status: ExecutionStatus
sweeps: Sweeps
ticks: TickBounds
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StageStatus".
 */
export interface StageStatus1 {
stage: StageName
status: ExecutionStatus
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepSummary".
 */
export interface SweepSummary {
attempt: Attempt4
data_origin: DataOrigin
direction: Direction1
execution_status: ExecutionStatus
sweep_id: SweepId2
up_to_tick: UpToTick3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TickBounds".
 */
export interface TickBounds {
first: First
last: Last
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentViewResponse".
 */
export interface ExperimentViewResponse {
experiment: ExperimentView
header: ProjectionHeader
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ExperimentsResponse".
 */
export interface ExperimentsResponse {
experiments: Experiments
header: ProjectionHeader
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "FieldManifest".
 */
export interface FieldManifest {
couplings_in: CouplingsIn
couplings_out: CouplingsOut
field_id: FieldId
name: Name1
package: Package
ports: Ports
purpose: Purpose
reads: Reads
requirements: Requirements
stage_status: StageStatus2
stages: Stages
state_space: (StateSpace | null)
writes: Writes
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "FieldsResponse".
 */
export interface FieldsResponse {
configuration_snapshot: (ConfigurationSnapshot | null)
coupling_matrix: CouplingMatrix
header: ProjectionHeader
manifests: Manifests
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "GovernanceProjection".
 */
export interface GovernanceProjection {
evaluations: BlockRuleEvaluationSet
header: ProjectionHeader
rules: Rules2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RuleView".
 */
export interface RuleView {
applies_to: AppliesTo1
description: Description1
kind: RuleKind
rule_id: RuleId1
version: Version14
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "HealthResponse".
 */
export interface HealthResponse {
adapters: Adapters
schema_versions: SchemaVersions
service_version: ServiceVersion
status: Status4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ImportCreated".
 */
export interface ImportCreated {
artifact_refs: ArtifactRefs
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricAux".
 */
export interface MetricAux1 {
fn: Fn
fp: Fp
function_ref: FunctionRef
hypotheses_excluded: HypothesesExcluded
new_inconsistencies: NewInconsistencies
not_applicable_excluded: NotApplicableExcluded
not_in_validity: NotInValidity2
observable_cases: ObservableCases
persisting: Persisting1
shared_coverage: (Rational | null)
shared_coverage_undefined: SharedCoverageUndefined
stale_known: StaleKnown
ticks_excluded: TicksExcluded
ticks_included: TicksIncluded
tp: Tp
undetermined_count: UndeterminedCount
unevaluable_count: UnevaluableCount
unevaluable_in_recovery: UnevaluableInRecovery
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricDefinition".
 */
export interface MetricDefinition {
formula: Formula
metric_id: MetricId
name: Name2
relations: Relations3
target_value: Rational
tick_set: TickSet
unit: Unit1
version: Version15
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "MetricsProjection".
 */
export interface MetricsProjection {
definitions: Definitions
header: ProjectionHeader
report: EvaluationReport
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "NodeView".
 */
export interface NodeView {
attributes: Attributes1
label: Label8
node_id: NodeId1
node_type: NodeType1
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ObservationProjection".
 */
export interface ObservationProjection {
header: ProjectionHeader
observation: BlockObservationProjectionBody
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "QueryEcho".
 */
export interface QueryEcho1 {
aggregation: (Aggregation | null)
attempt: Attempt2
comparison_id: ComparisonId1
direction: Direction
from: From1
revision: Revision1
to: To1
to_tick: ToTick4
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RecoveryVariantCreated".
 */
export interface RecoveryVariantCreated {
authority_ref: ArtifactRef
scenario_ref: (ArtifactRef | null)
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "RelationView".
 */
export interface RelationView {
relation_id: RelationId1
relation_type: RelationType
source: Source3
target: Target2
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayCreated".
 */
export interface ReplayCreated {
experiment_id: ExperimentId35
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ReplayReportResponse".
 */
export interface ReplayReportResponse {
header: ProjectionHeader
report: ReplayReport
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ResultsProjection".
 */
export interface ResultsProjection {
authority_records: AuthorityRecords
forward: BlockForwardResult
header: ProjectionHeader
inverse: BlockInverseResult
proposals: Proposals
reconstruction: BlockReconstructionResult
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ScenarioEntry".
 */
export interface ScenarioEntry {
fixture_lineage_id: FixtureLineageId2
is_fixture: IsFixture2
label: Label9
observation_configs: ObservationConfigs
scenario_id: ScenarioId3
targets: Targets
tick_count: TickCount1
variant_kind: VariantKind
variant_of: VariantOf
version: Version16
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ScenariosResponse".
 */
export interface ScenariosResponse {
header: ProjectionHeader
scenarios: Scenarios
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "StateProjection".
 */
export interface StateProjection {
delta: (DeltaStateA | null)
header: ProjectionHeader
values: Values3
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "SweepsCreated".
 */
export interface SweepsCreated {
sweep_ids: SweepIds
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TopologyProjection".
 */
export interface TopologyProjection {
header: ProjectionHeader
topology: TopologyProjectionBody
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TopologyProjectionBody".
 */
export interface TopologyProjectionBody {
nodes: Nodes2
relations: Relations4
topology_ref: ArtifactRef
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "TraceProjection".
 */
export interface TraceProjection {
header: ProjectionHeader
registry_labels: RegistryLabels
sweep: SweepRun
trace: BlockSweepTrace
}
/**
 * This interface was referenced by `CiraContracts`'s JSON-Schema
 * via the `definition` "ViewState".
 */
export interface ViewState {
data_experiment_id: DataExperimentId
data_tick: DataTick
error: (ErrorRecord | null)
status: ViewStatus
}
