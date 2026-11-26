"""Artifact type registry, per-type envelopes and AnyEnvelope (Kap. 08.1, 08.11, K-05, K-36)."""

from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, create_model

from .common import (ArtifactId, ArtifactRef, ContentHash, Frozen, Provenance, SchemaVersion, SemVer, StableId,
                     StageEvent, Tick)
from .experiments import ManifestEntry, ReplayReport
from .f01 import ImmutableTopology, TopologyDefinition
from .f02 import AuthorityRecord, GovernanceDefinition, RuleEvaluationSet
from .f03 import (ActualState, ConsistencyAnnotationSet, EventRecord, ExperimentDefinition,
                  ScenarioDefinition)
from .f04_public import (ObservableRules, ObservableTopologyDefinition, ObservationBundle,
                         SourceReferenceRegister, TargetDefinition)
from .f04_record import ObservationConfig, ObservationRecord
from .f05 import (ForwardResult, InverseResult, OperatorRegistry, ReconstructionResult,
                  RecoveryProposal, SweepRun)
from .f06 import ComparisonReport, EvaluationReport, WeightSet

CONTRACT_VERSION = "1.0.2"

ARTIFACT_TYPES: dict[str, type[BaseModel]] = {
    "topology_definition": TopologyDefinition,
    "immutable_topology": ImmutableTopology,
    "governance_definition": GovernanceDefinition,
    "authority_record": AuthorityRecord,
    "scenario_definition": ScenarioDefinition,
    "consistency_annotation_set": ConsistencyAnnotationSet,
    "experiment_definition": ExperimentDefinition,
    "actual_state": ActualState,
    "event_record": EventRecord,
    "observation_config": ObservationConfig,
    "observable_topology": ObservableTopologyDefinition,
    "observable_rules": ObservableRules,
    "source_register": SourceReferenceRegister,
    "observation_bundle": ObservationBundle,
    "observation_record": ObservationRecord,
    "target_definition": TargetDefinition,
    "sweep_run": SweepRun,
    "forward_result": ForwardResult,
    "inverse_result": InverseResult,
    "reconstruction_result": ReconstructionResult,
    "recovery_proposal": RecoveryProposal,
    "rule_evaluation_set": RuleEvaluationSet,
    "evaluation_report": EvaluationReport,
    "comparison_report": ComparisonReport,
    "weight_set": WeightSet,
    "operator_registry": OperatorRegistry,
    "replay_report": ReplayReport,
}
assert len(ARTIFACT_TYPES) == 27


def schema_version(artifact_type: str) -> str:
    return f"cira.{artifact_type}/{CONTRACT_VERSION}"


class EnvelopeBase(Frozen):
    schema_version: SchemaVersion
    experiment_id: StableId | None
    artifact_id: ArtifactId
    revision: Annotated[int, Field(ge=0)]
    logical_key: str
    tick: Tick | None
    provenance: Provenance
    content_hash: ContentHash


def _camel(name: str) -> str:
    return "".join(p.capitalize() for p in name.split("_"))


ENVELOPES: dict[str, type[EnvelopeBase]] = {}
for _name, _model in ARTIFACT_TYPES.items():
    ENVELOPES[_name] = create_model(
        f"Envelope{_camel(_name)}", __base__=EnvelopeBase,
        artifact_type=(Literal[_name], ...), payload=(_model, ...))

AnyEnvelope = Annotated[Union[tuple(ENVELOPES.values())], Field(discriminator="artifact_type")]  # type: ignore[valid-type]


class BundleDefinitions(Frozen):  # K-36
    topology: ArtifactRef
    governance: ArtifactRef
    scenario: ArtifactRef
    annotations: ArtifactRef | None = None
    observation_config: ArtifactRef
    target: ArtifactRef
    weight_set: ArtifactRef
    experiment_definition: ArtifactRef
    operator_registry: ArtifactRef | None = None


class ExperimentBundle(Frozen):
    bundle_version: SemVer
    experiment_id: StableId
    definitions: BundleDefinitions
    artifacts: tuple[AnyEnvelope, ...]  # type: ignore[valid-type]
    stage_events: tuple[StageEvent, ...]  # without recorded_at (K-52)
    events: tuple[EventRecord, ...]
    manifest: tuple[ManifestEntry, ...]
    bundle_hash: ContentHash
