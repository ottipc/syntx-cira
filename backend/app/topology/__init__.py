"""F01_DOMAIN_TOPOLOGY — validate and seal topology definitions (Kap. 04 F01, 06.1)."""

from .validate import seal, validate_topology

__all__ = ["validate_topology", "seal"]
