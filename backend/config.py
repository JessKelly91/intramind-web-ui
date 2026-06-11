"""Configuration for the IntraMind Web UI backend.

Centralizes all auth / multi-tenancy / CORS / rate-limit settings so they can be
driven entirely from the environment (or a .env file) with no code changes.

Everything here is local-first and $0: API keys live in an env var or a JSON
file on disk, not a hosted identity provider.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend settings, populated from environment variables / .env.

    All variables are prefixed with ``WEB_UI_`` to avoid colliding with the
    AI Agent's own settings when both run in the same process / venv.
    """

    model_config = SettingsConfigDict(
        env_prefix="WEB_UI_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Authentication -----------------------------------------------------
    # Inline JSON map of API key -> tenant config. Example:
    #   WEB_UI_API_KEYS='{"sk-acme-123": {"tenant_id": "acme", "name": "Acme"}}'
    api_keys: str | None = None
    # Path to a JSON file with the same shape (takes precedence over api_keys).
    api_keys_file: str | None = None
    # When true, the legacy permissive behavior is preserved: the well-known
    # demo keys are accepted and mapped to a non-namespaced "dev" tenant.
    # Secure-by-default: this is OFF unless explicitly enabled.
    auth_dev_mode: bool = False

    # --- Multi-tenancy ------------------------------------------------------
    # When true, every tenant's collections are namespaced with its prefix
    # before being passed to the API Gateway (and stripped on the way back),
    # so one tenant can never read or mutate another tenant's collections.
    enable_tenant_namespacing: bool = True
    # Separator inserted between the tenant prefix and the collection name.
    tenant_namespace_separator: str = "__"

    # --- CORS ---------------------------------------------------------------
    # Comma-separated list of allowed origins. Empty means "no cross-origin
    # browsers allowed" unless auth_dev_mode is on (then localhost is allowed).
    cors_allowed_origins: str = ""

    # --- Rate limiting ------------------------------------------------------
    rate_limit_enabled: bool = True
    # Default requests-per-minute per tenant; individual tenants can override.
    default_rate_limit_per_minute: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS origins into a clean list."""
        origins = [o.strip() for o in self.cors_allowed_origins.split(",")]
        return [o for o in origins if o]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (read once per process)."""
    return Settings()
