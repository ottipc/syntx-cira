"""Adapter variants (S-02): FixtureAdapter, ImportExportAdapter, LocalAdapter and ApiAdapter (contract-true stubs)."""

from __future__ import annotations

from typing import Any

from ...contracts.common import AdapterKind
from ..protocol import EngineAdapter
from .api import ApiAdapter
from .fixture import FixtureAdapter
from .import_export import ImportExportAdapter
from .local import LocalAdapter


def make_adapter(kind: AdapterKind, config_ref: str, **kw: Any) -> EngineAdapter:
    if kind is AdapterKind.FIXTURE:
        return FixtureAdapter(config_ref)
    if kind is AdapterKind.IMPORT:
        return ImportExportAdapter(config_ref, kw.get("documents", {}))
    if kind is AdapterKind.LOCAL:
        return LocalAdapter(config_ref)
    return ApiAdapter(config_ref)


__all__ = ["make_adapter", "FixtureAdapter", "ImportExportAdapter", "LocalAdapter", "ApiAdapter"]
