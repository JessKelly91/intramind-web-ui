"""API key validation endpoint."""

from fastapi import APIRouter, Depends

from auth import require_tenant
from tenancy import Tenant

router = APIRouter(prefix="/api/validate", tags=["validate"])


@router.get("")
async def validate_api_key(tenant: Tenant = Depends(require_tenant)):
    """Validate the supplied API key.

    Returns 200 with the resolved tenant identity when the key is valid;
    ``require_tenant`` raises 401 (invalid key) or 429 (rate limited) otherwise.
    """
    return {
        "valid": True,
        "message": "API key is valid",
        "tenant": tenant.tenant_id,
        "name": tenant.name,
    }
