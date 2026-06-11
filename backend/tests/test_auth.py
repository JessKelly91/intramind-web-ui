"""Unit tests for API key resolution and the rate limiter."""

import json

import pytest

from auth import AuthManager, RateLimitError, SlidingWindowRateLimiter
from config import Settings


def _settings(**overrides) -> Settings:
    base = dict(
        api_keys=None,
        api_keys_file=None,
        auth_dev_mode=False,
        enable_tenant_namespacing=True,
        rate_limit_enabled=True,
        default_rate_limit_per_minute=60,
        cors_allowed_origins="",
    )
    base.update(overrides)
    return Settings(**base)


def test_configured_key_resolves_to_tenant():
    keys = {"sk-acme-123": {"tenant_id": "acme", "name": "Acme Corp"}}
    mgr = AuthManager(_settings(api_keys=json.dumps(keys)))

    tenant = mgr.resolve("sk-acme-123")
    assert tenant is not None
    assert tenant.tenant_id == "acme"
    assert tenant.name == "Acme Corp"
    assert tenant.namespaced("docs") == "acme__docs"


def test_unknown_key_is_rejected():
    keys = {"sk-acme-123": {"tenant_id": "acme"}}
    mgr = AuthManager(_settings(api_keys=json.dumps(keys)))

    assert mgr.resolve("sk-nope") is None
    assert mgr.resolve("") is None
    assert mgr.resolve(None) is None


def test_dev_mode_accepts_demo_key_without_namespacing():
    mgr = AuthManager(_settings(auth_dev_mode=True))

    tenant = mgr.resolve("demo-api-key")
    assert tenant is not None
    assert tenant.tenant_id == "dev"
    assert tenant.is_dev is True
    # Dev tenant is not namespaced.
    assert tenant.namespaced("docs") == "docs"


def test_dev_keys_rejected_when_dev_mode_off():
    mgr = AuthManager(_settings(auth_dev_mode=False))
    assert mgr.resolve("demo-api-key") is None


def test_namespacing_disabled_clears_prefix():
    keys = {"sk-acme-123": {"tenant_id": "acme"}}
    mgr = AuthManager(
        _settings(api_keys=json.dumps(keys), enable_tenant_namespacing=False)
    )
    tenant = mgr.resolve("sk-acme-123")
    assert tenant.namespaced("docs") == "docs"


def test_custom_collection_prefix_is_respected():
    keys = {"sk-acme-123": {"tenant_id": "acme", "collection_prefix": "team-a"}}
    mgr = AuthManager(_settings(api_keys=json.dumps(keys)))
    tenant = mgr.resolve("sk-acme-123")
    assert tenant.namespaced("docs") == "team-a__docs"


def test_invalid_key_config_raises():
    with pytest.raises(ValueError):
        AuthManager(_settings(api_keys=json.dumps({"k": {"name": "no tenant id"}})))


def test_rate_limiter_blocks_after_limit():
    limiter = SlidingWindowRateLimiter()
    # 2 requests allowed, 3rd should be blocked.
    limiter.check("acme", 2)
    limiter.check("acme", 2)
    with pytest.raises(RateLimitError):
        limiter.check("acme", 2)


def test_rate_limiter_is_per_tenant():
    limiter = SlidingWindowRateLimiter()
    limiter.check("acme", 1)
    # Different tenant has its own budget.
    limiter.check("globex", 1)
    with pytest.raises(RateLimitError):
        limiter.check("acme", 1)


def test_rate_limiter_zero_means_unlimited():
    limiter = SlidingWindowRateLimiter()
    for _ in range(100):
        limiter.check("acme", 0)  # should never raise
