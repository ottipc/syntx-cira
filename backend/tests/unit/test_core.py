"""core: canonical JSON, hashing, rational, ids, K3, delta (15.2) — TX21 code points, NFC, hash stability."""

from __future__ import annotations

import json
import unicodedata
from fractions import Fraction

import pytest
from hypothesis import given
from hypothesis import strategies as st

from app.core import ids
from app.core.canonical_json import canonical_bytes
from app.core.delta import delta_coupling, delta_state
from app.core.hashing import artifact_id, content_hash
from app.core.rational import as_fraction, ratio, to_pair
from app.core.unicode import CANONICAL_SYMBOLS, CONFUSABLES, is_canonical_symbol, is_sigma_id_v181


@pytest.mark.tid("TX21")
@pytest.mark.req("REQ-007")
def test_hash_stability_reference_values() -> None:
    """Locked values, independently verified with coreutils sha256sum on the canonical bytes."""
    p = {"b": "Σ01", "a": [1, 2], "c": "∆"}
    assert canonical_bytes(p) == '{"a":[1,2],"b":"Σ01","c":"∆"}'.encode()
    assert artifact_id("actual_state", p) == "art:6cdaeb828e2cae064ba7bc54e9847547"
    assert content_hash(p) == "sha256:ec48b9106b5af481f05df3139bdd34bc93e01395b023ad0f612615c1aade2973"


@pytest.mark.tid("TX21")
def test_nfc_normalisation_makes_hash_stable() -> None:
    composed = "Komponente é"
    decomposed = unicodedata.normalize("NFD", composed)
    assert composed != decomposed
    assert content_hash({"k": composed}) == content_hash({"k": decomposed})
    assert content_hash({decomposed: 1}) == content_hash({composed: 1})


@pytest.mark.tid("TX21")
@pytest.mark.req("REQ-007")
def test_code_points_and_confusables() -> None:
    assert len(CANONICAL_SYMBOLS) == 13
    for s, cp in CANONICAL_SYMBOLS.items():
        assert ord(s) == cp and is_canonical_symbol(s)
    assert ord("∆") == 0x2206 and not is_canonical_symbol("Δ")
    for bad in CONFUSABLES:
        if bad not in CANONICAL_SYMBOLS:
            assert not is_canonical_symbol(bad)
    assert is_sigma_id_v181("Σ01") and is_sigma_id_v181("Σ30")
    for bad in ("Σ00", "Σ31", "∑01", "Ʃ01", "S01", "Σ1"):
        assert not is_sigma_id_v181(bad)


@pytest.mark.tid("TX21")
def test_canonical_json_rejects_nan_and_sorts() -> None:
    with pytest.raises(ValueError):
        canonical_bytes({"x": float("nan")})
    assert canonical_bytes({"b": 1, "a": {"d": 2, "c": 3}}) == b'{"a":{"c":3,"d":2},"b":1}'


@given(st.recursive(st.none() | st.booleans() | st.integers() | st.text(),
                    lambda c: st.lists(c, max_size=4) | st.dictionaries(st.text(max_size=5), c, max_size=4),
                    max_leaves=20))
def test_canonical_json_roundtrip_property(v: object) -> None:
    b = canonical_bytes(v)
    assert canonical_bytes(json.loads(b)) == b


def test_rational() -> None:
    assert to_pair(Fraction(6, 8)) == (3, 4)
    assert ratio(Fraction(0), Fraction(0)) is None
    assert ratio(Fraction(1), Fraction(8)) == Fraction(1, 8)
    with pytest.raises(ValueError):
        as_fraction(1, 0)
    with pytest.raises(ValueError):
        to_pair(Fraction(-1, 2))


@pytest.mark.req("REQ-011")
def test_ids() -> None:
    assert ids.attr_id("n01", "state") == "attr:n01/state"
    assert ids.attr_node("attr:n01/state") == "node:n01"
    assert ids.rel_id("depends_on", "n02", "n01") == "rel:depends_on:n02:n01"
    assert ids.obs_id(None, "attr:n07/state", 3) == "obs:none:n07/state:t3"
    assert ids.sweep_id("FORWARD", 2, 0) == "sweep:fwd:t2:a0"
    assert ids.sweep_id("INVERSE", 2, 1) == "sweep:inv:t2:a1"
    assert ids.recon_id(4, 0) == "recon:t4:a0"
    assert ids.is_stable_id("node:n01") and not ids.is_stable_id("Node:n01")


@pytest.mark.req("REQ-031")
def test_delta_pure_and_sorted() -> None:
    b = {"attr:b": ("DETERMINED", "X"), "attr:a": ("DETERMINED", "Y")}
    a = {"attr:b": ("DETERMINED", "Z"), "attr:c": ("UNDETERMINED", None)}
    assert delta_state(b, a) == [("attr:a", ("DETERMINED", "Y"), ("ABSENT", None)),
                                 ("attr:b", ("DETERMINED", "X"), ("DETERMINED", "Z")),
                                 ("attr:c", ("ABSENT", None), ("UNDETERMINED", None))]
    assert delta_coupling({"rel:x": "POSSIBLE"}, {"rel:x": "EFFECTIVE", "rel:a": "UNKNOWN_OPEN"}) == [
        ("rel:a", "ABSENT", "UNKNOWN_OPEN"), ("rel:x", "POSSIBLE", "EFFECTIVE")]
    assert delta_state(b, b) == []
