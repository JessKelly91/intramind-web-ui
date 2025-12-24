"""
API validation endpoints
"""

from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/api/validate", tags=["validate"])


@router.get("")
async def validate_api_key(
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Validate an API key
    
    Returns 200 if valid, 401 if invalid
    """
    # TODO: In Phase 5, implement proper API key validation
    # For Phase 1, accept demo key or any non-empty key
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    # In development, accept demo key
    if x_api_key == "demo-api-key":
        return {"valid": True, "message": "API key is valid"}
    
    # TODO: Check against database/service
    # For now, accept any non-empty key in development
    return {"valid": True, "message": "API key is valid"}

