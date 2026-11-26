"""TX14 / TX17 / T02 — contract walkthrough over all 27 artifact types (K-36, K-54, 15.3, 15.9)."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any

import pytest
from pydantic import BaseModel, TypeAdapter, ValidationError

from app.contracts.common import ArtifactRef
from app.contracts.registry import ARTIFACT_TYPES, AnyEnvelope, ExperimentBundle
from app.core.hashing import artifact_id, content_hash
from app.experiments.bundle import verify_bundle_hash
from tests.conftest import FIXTURES

BUNDLE = FIXTURES / "bundles" / "fx_bundle_tx14.json"


def load() -> ExperimentBundle:
    return ExperimentBundle.model_validate_json(BUNDLE.read_text(encoding="utf-8"))


@pytest.mark.tid("TX14")
@pytest.mark.req("REQ-066")
@pytest.mark.req("REQ-067")
@pytest.mark.req("REQ-074")
def test_bundle_valid_with_all_27_types_and_hash() -> None:
    b = load()
    assert {e.artifact_type for e in b.artifacts} == set(ARTIFACT_TYPES)  # type: ignore[attr-defined]
    assert len(ARTIFACT_TYPES) == 27
    assert verify_bundle_hash(b)


@pytest.mark.tid("TX14")
@pytest.mark.tid("T02")
@pytest.mark.req("REQ-064")
@pytest.mark.req("REQ-063")
def test_roundtrip_json_and_python_mode() -> None:
    b = load()
    assert ExperimentBundle.model_validate_json(b.model_dump_json(by_alias=True)) == b
    for e in b.artifacts:
        p: BaseModel = e.payload  # type: ignore[attr-defined]
        cls = type(p)
        assert cls.model_validate_json(p.model_dump_json(by_alias=True)) == p
        # Python mode (strict) roundtrip of the dumped python structure
        assert cls.model_validate(p.model_dump(by_alias=True)) == p
        # content addressing is stable
        pj = p.model_dump(mode="json", by_alias=True)
        assert e.artifact_id == artifact_id(e.artifact_type, pj)  # type: ignore[attr-defined]
        assert e.content_hash == content_hash(pj)  # type: ignore[attr-defined]


def _refs(obj: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    if isinstance(obj, dict):
        if set(obj) == {"artifact_id", "artifact_type", "content_hash"}:
            out.append(obj)
        for v in obj.values():
            out.extend(_refs(v))
    elif isinstance(obj, list):
        for v in obj:
            out.extend(_refs(v))
    return out


@pytest.mark.tid("TX14")
@pytest.mark.req("REQ-058")
@pytest.mark.req("REQ-011")
def test_all_references_resolvable() -> None:
    b = load()
    raw = json.loads(BUNDLE.read_text(encoding="utf-8"))
    known = {(e.artifact_id, e.artifact_type, e.content_hash) for e in b.artifacts}  # type: ignore[attr-defined]
    refs = _refs(raw)
    assert len(refs) > 50
    for r in refs:
        ArtifactRef.model_validate(r)
        assert (r["artifact_id"], r["artifact_type"], r["content_hash"]) in known, r
    manifest = {(m.artifact_id, m.artifact_type, m.content_hash) for m in b.manifest}
    assert manifest == known


def _walk(model: BaseModel, seen: dict[tuple[str, str], bool]) -> None:
    for name, info in type(model).model_fields.items():
        value = getattr(model, name)
        optional = not info.is_required() and info.default is None
        if optional:
            key = (type(model).__name__, name)
            seen[key] = seen.get(key, False) or value is not None
        for v in (value if isinstance(value, tuple) else (value,)):
            if isinstance(v, BaseModel):
                _walk(v, seen)


@pytest.mark.tid("TX14")
def test_every_optional_field_filled_at_least_once() -> None:
    """15.9: 'Vertragsfeld nie befüllt' — each optional field is non-null in at least one instance."""
    b = load()
    seen: dict[tuple[str, str], bool] = {}
    _walk(b, seen)
    never = sorted(k for k, v in seen.items() if not v)
    assert never == [], never


@pytest.mark.tid("TX17")
@pytest.mark.req("REQ-066")
@pytest.mark.req("REQ-067")
def test_anyenvelope_discriminates_each_type() -> None:
    ta: TypeAdapter[Any] = TypeAdapter(AnyEnvelope)
    raw = json.loads(BUNDLE.read_text(encoding="utf-8"))
    by_type: dict[str, dict[str, Any]] = {}
    for e in raw["artifacts"]:
        by_type.setdefault(e["artifact_type"], e)
    for t, e in by_type.items():
        env = ta.validate_json(json.dumps(e, ensure_ascii=False))
        assert type(env.payload) is ARTIFACT_TYPES[t]
        assert env.schema_version == f"cira.{t}/1.0.2"
    # a payload under the wrong discriminator is rejected
    wrong = dict(by_type["actual_state"], artifact_type="event_record")
    with pytest.raises(ValidationError):
        ta.validate_json(json.dumps(wrong, ensure_ascii=False))
    unknown = dict(by_type["actual_state"], artifact_type="not_a_type")
    with pytest.raises(ValidationError):
        ta.validate_json(json.dumps(unknown, ensure_ascii=False))


@pytest.mark.tid("TX14")
def test_revisions_count_per_logical_key() -> None:
    b = load()
    groups: dict[tuple[str, str], list[int]] = defaultdict(list)
    for e in b.artifacts:
        groups[(e.artifact_type, e.logical_key)].append(e.revision)  # type: ignore[attr-defined]
    for revs in groups.values():
        assert sorted(revs) == list(range(len(revs)))
    assert groups[("authority_record", "auth:d1")] == [0, 1]


@pytest.mark.tid("TX14")
def test_bundle_regenerates_identically(tmp_path: Path) -> None:
    import importlib.util
    spec = importlib.util.spec_from_file_location("b", Path(__file__).resolve().parents[2] / "scripts" / "build_tx14_bundle.py")
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    out = tmp_path / "b.json"
    mod.build(out)
    assert out.read_bytes() == BUNDLE.read_bytes()
