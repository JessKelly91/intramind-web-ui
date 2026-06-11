"""Authentication, tenant resolution, and rate limiting for the Web UI backend.

This module replaces the per-endpoint stub checks with a single FastAPI
dependency, :func:`require_tenant`, that:

1. Resolves the ``X-API-Key`` header to a configured :class:`Tenant`
   (constant-time comparison; unknown keys are rejected with 401).
2. Enforces a per-tenant request rate limit (429 when exceeded).

Key material is loaded from the environment (a JSON map or a JSON file) so the
whole thing stays local and free. A dev-mode escape hatch preserves the legacy
``demo-api-key`` behavior for local demos.
"""

from __future__ import annotations

import json
import logging
import secrets
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import Header, HTTPException

from config import Settings, get_settings
from tenancy import Tenant

logger = logging.getLogger(__name__)

# Well-known keys accepted only when auth_dev_mode is enabled. The dev tenant
# uses an empty collection_prefix so existing local data stays visible.
_DEV_KEYS = {"demo-api-key", "test-api-key"}
_DEV_TENANT_ID = "dev"


class AuthError(HTTPException):
    """401 raised when an API key is missing or unrecognized."""

    def __init__(self, detail: str = "Invalid or missing API key") -> None:
        super().__init__(status_code=401, detail=detail)


class RateLimitError(HTTPException):
    """429 raised when a tenant exceeds its per-minute request budget."""

    def __init__(self, retry_after: int = 60) -> None:
        super().__init__(
            status_code=429,
            detail="Rate limit exceeded. Please slow down and retry shortly.",
            headers={"Retry-After": str(retry_after)},
        )


class SlidingWindowRateLimiter:
    """In-memory per-tenant sliding-window rate limiter.

    Lightweight and dependency-free. Suitable for a single-process backend; for
    multi-instance deployments this should be backed by Redis (noted in docs).
    """

    WINDOW_SECONDS = 60

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, tenant_id: str, limit_per_minute: int) -> None:
        """Record a hit for ``tenant_id``; raise RateLimitError if over budget."""
        if limit_per_minute <= 0:
            return  # 0 / negative means "unlimited"
        now = time.monotonic()
        cutoff = now - self.WINDOW_SECONDS
        with self._lock:
            bucket = self._hits[tenant_id]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= limit_per_minute:
                oldest = bucket[0]
                retry_after = max(1, int(self.WINDOW_SECONDS - (now - oldest)))
                raise RateLimitError(retry_after=retry_after)
            bucket.append(now)

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


class AuthManager:
    """Resolves API keys to tenants based on the active settings."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._tenants: dict[str, Tenant] = self._load_tenants(settings)
        self.settings = settings
        if not self._tenants and not settings.auth_dev_mode:
            logger.warning(
                "No API keys configured and auth_dev_mode is off; the Web UI "
                "backend will reject all requests. Set WEB_UI_API_KEYS (or "
                "WEB_UI_API_KEYS_FILE), or enable WEB_UI_AUTH_DEV_MODE for local dev."
            )

    @staticmethod
    def _load_raw_keys(settings: Settings) -> dict:
        """Load the raw {api_key: tenant_config} mapping from file or env."""
        if settings.api_keys_file:
            path = Path(settings.api_keys_file)
            if not path.exists():
                raise FileNotFoundError(
                    f"WEB_UI_API_KEYS_FILE points to a missing file: {path}"
                )
            return json.loads(path.read_text(encoding="utf-8"))
        if settings.api_keys:
            return json.loads(settings.api_keys)
        return {}

    def _load_tenants(self, settings: Settings) -> dict[str, Tenant]:
        raw = self._load_raw_keys(settings)
        tenants: dict[str, Tenant] = {}
        for api_key, cfg in raw.items():
            if not isinstance(cfg, dict):
                raise ValueError(
                    f"Tenant config for a key must be an object, got {type(cfg)}"
                )
            tenant_id = cfg.get("tenant_id")
            if not tenant_id:
                raise ValueError("Each API key config requires a 'tenant_id'")
            prefix = cfg.get("collection_prefix", tenant_id)
            if not settings.enable_tenant_namespacing:
                prefix = ""
            tenants[api_key] = Tenant(
                tenant_id=tenant_id,
                name=cfg.get("name", tenant_id),
                rate_limit_per_minute=int(
                    cfg.get(
                        "rate_limit_per_minute",
                        settings.default_rate_limit_per_minute,
                    )
                ),
                collection_prefix=prefix,
                namespace_separator=settings.tenant_namespace_separator,
            )
        return tenants

    def resolve(self, api_key: str | None) -> Tenant | None:
        """Return the Tenant for ``api_key`` or None if unrecognized.

        Uses constant-time comparison against every configured key to avoid
        leaking which prefix matched via timing.
        """
        if not api_key:
            return None

        matched: Tenant | None = None
        for known_key, tenant in self._tenants.items():
            if secrets.compare_digest(api_key, known_key):
                matched = tenant
        if matched is not None:
            return matched

        if self._settings.auth_dev_mode:
            for dev_key in _DEV_KEYS:
                if secrets.compare_digest(api_key, dev_key):
                    return Tenant(
                        tenant_id=_DEV_TENANT_ID,
                        name="Local Dev",
                        rate_limit_per_minute=self._settings.default_rate_limit_per_minute,
                        collection_prefix="",  # no namespacing in dev
                        namespace_separator=self._settings.tenant_namespace_separator,
                        is_dev=True,
                    )
        return None


# --- Module-level singletons (rebuildable for tests) ------------------------
_auth_manager: AuthManager | None = None
_rate_limiter = SlidingWindowRateLimiter()


def get_auth_manager() -> AuthManager:
    global _auth_manager
    if _auth_manager is None:
        _auth_manager = AuthManager(get_settings())
    return _auth_manager


def configure(settings: Settings) -> None:
    """Rebuild auth state from explicit settings (used by tests)."""
    global _auth_manager
    _auth_manager = AuthManager(settings)
    _rate_limiter.reset()


async def require_tenant(
    x_api_key: str = Header(..., alias="X-API-Key"),
) -> Tenant:
    """FastAPI dependency: authenticate the caller and enforce rate limits.

    Returns the resolved :class:`Tenant`, which downstream handlers use to
    namespace collections and isolate conversation state.
    """
    manager = get_auth_manager()
    tenant = manager.resolve(x_api_key)
    if tenant is None:
        raise AuthError()

    if manager.settings.rate_limit_enabled:
        _rate_limiter.check(tenant.tenant_id, tenant.rate_limit_per_minute)

    return tenant
