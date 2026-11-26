"""Write-once content-addressed artifact store with per-field capabilities (Kap. 05.3, 05.4 L3; K-04)."""

from .capabilities import AccessViolation, FieldReader, FieldWriter, capabilities
from .cas import ArtifactStore

__all__ = ["ArtifactStore", "FieldReader", "FieldWriter", "AccessViolation", "capabilities"]
