"""Unit tests for tenant collection namespacing."""

from tenancy import Tenant


def _tenant(prefix: str) -> Tenant:
    return Tenant(
        tenant_id="acme",
        name="Acme",
        rate_limit_per_minute=60,
        collection_prefix=prefix,
        namespace_separator="__",
    )


def test_namespaced_adds_prefix():
    t = _tenant("acme")
    assert t.namespaced("docs") == "acme__docs"


def test_namespaced_is_idempotent():
    t = _tenant("acme")
    once = t.namespaced("docs")
    assert t.namespaced(once) == once


def test_display_strips_prefix():
    t = _tenant("acme")
    assert t.display("acme__docs") == "docs"


def test_owns_only_matching_prefix():
    t = _tenant("acme")
    assert t.owns("acme__docs") is True
    assert t.owns("globex__docs") is False


def test_empty_prefix_is_passthrough_and_global():
    t = _tenant("")
    assert t.namespaced("docs") == "docs"
    assert t.display("docs") == "docs"
    # An un-namespaced tenant sees the whole (global) collection space.
    assert t.owns("anything") is True
