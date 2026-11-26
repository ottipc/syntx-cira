"""F07 projection API (Kap. 10)."""

from __future__ import annotations

from typing import Any


def create_app(*args: Any, **kwargs: Any) -> Any:
    from .main import create_app as _create
    return _create(*args, **kwargs)


__all__ = ["create_app"]
