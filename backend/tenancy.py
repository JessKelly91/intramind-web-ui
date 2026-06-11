"""Tenant model and collection-namespacing helpers.

A :class:`Tenant` represents the identity behind an API key. Its
``collection_prefix`` is the mechanism that isolates one tenant's documents
from another's: every collection name is rewritten to ``<prefix><sep><name>``
before it reaches the API Gateway, and the prefix is stripped again before any
name is returned to the client.

A tenant with an empty ``collection_prefix`` (e.g. the dev tenant) is *not*
namespaced and therefore sees the global, un-prefixed collection space. This is
intentional for local development and backwards compatibility.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Tenant:
    """An authenticated caller, resolved from an API key."""

    tenant_id: str
    name: str
    rate_limit_per_minute: int
    collection_prefix: str = ""
    namespace_separator: str = "__"
    # True when this tenant came from the dev-mode fallback rather than a
    # configured key. Used only for logging / diagnostics.
    is_dev: bool = field(default=False, compare=False)

    @property
    def _full_prefix(self) -> str:
        if not self.collection_prefix:
            return ""
        return f"{self.collection_prefix}{self.namespace_separator}"

    def namespaced(self, collection: str) -> str:
        """Return the gateway-facing collection name for this tenant."""
        prefix = self._full_prefix
        if not prefix:
            return collection
        if collection.startswith(prefix):
            # Already namespaced (defensive against double-prefixing).
            return collection
        return f"{prefix}{collection}"

    def owns(self, gateway_collection: str) -> bool:
        """True if ``gateway_collection`` belongs to this tenant."""
        prefix = self._full_prefix
        if not prefix:
            # No namespacing -> tenant sees the global space.
            return True
        return gateway_collection.startswith(prefix)

    def display(self, gateway_collection: str) -> str:
        """Strip the tenant prefix for presentation back to the client."""
        prefix = self._full_prefix
        if prefix and gateway_collection.startswith(prefix):
            return gateway_collection[len(prefix):]
        return gateway_collection
