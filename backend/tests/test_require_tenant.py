"""End-to-end tests for the require_tenant FastAPI dependency.

Builds a throwaway app wired only to the dependency, so we cover the real
401 / 429 / 200 paths without importing the AI Agent stack.
"""

import json

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

import auth
from config import Settings
from tenancy import Tenant


def _build_client(**settings_overrides) -> TestClient:
    base = dict(
        api_keys=json.dumps({"sk-acme-123": {"tenant_id": "acme", "name": "Acme"}}),
        auth_dev_mode=False,
        rate_limit_enabled=True,
        default_rate_limit_per_minute=60,
    )
    base.update(settings_overrides)
    auth.configure(Settings(**base))

    app = FastAPI()

    @app.get("/protected")
    async def protected(tenant: Tenant = Depends(auth.require_tenant)):
        return {"tenant": tenant.tenant_id}

    return TestClient(app, raise_server_exceptions=True)


def test_missing_key_returns_422_or_401():
    client = _build_client()
    # No X-API-Key header -> FastAPI rejects the required header (422).
    resp = client.get("/protected")
    assert resp.status_code in (401, 422)


def test_invalid_key_returns_401():
    client = _build_client()
    resp = client.get("/protected", headers={"X-API-Key": "wrong"})
    assert resp.status_code == 401


def test_valid_key_returns_tenant():
    client = _build_client()
    resp = client.get("/protected", headers={"X-API-Key": "sk-acme-123"})
    assert resp.status_code == 200
    assert resp.json()["tenant"] == "acme"


def test_rate_limit_returns_429():
    client = _build_client(default_rate_limit_per_minute=3)
    headers = {"X-API-Key": "sk-acme-123"}
    for _ in range(3):
        assert client.get("/protected", headers=headers).status_code == 200
    resp = client.get("/protected", headers=headers)
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers


def test_rate_limit_disabled_allows_many():
    client = _build_client(rate_limit_enabled=False, default_rate_limit_per_minute=1)
    headers = {"X-API-Key": "sk-acme-123"}
    for _ in range(5):
        assert client.get("/protected", headers=headers).status_code == 200
