"""
Collections API endpoints
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/collections", tags=["collections"])


class Collection(BaseModel):
    name: str
    documentCount: int
    createdAt: str
    description: Optional[str] = None


class CreateCollectionRequest(BaseModel):
    name: str
    description: Optional[str] = None


@router.get("", response_model=List[Collection])
async def list_collections(
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Get list of all collections
    
    This endpoint proxies to the API Gateway
    """
    # Validate API key (placeholder - will be implemented properly)
    if not x_api_key or x_api_key == "demo-api-key":
        # In development, allow demo key
        pass
    else:
        # TODO: Validate API key against database/service
        pass
    
    # TODO: In Phase 4, integrate with API Gateway
    # For now, return mock data
    return [
        Collection(
            name="demo-collection",
            documentCount=0,
            createdAt="2025-01-01T00:00:00Z",
            description="Demo collection"
        )
    ]


@router.post("", response_model=Collection)
async def create_collection(
    request: CreateCollectionRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Create a new collection
    
    This endpoint proxies to the API Gateway
    """
    # Validate API key
    if not x_api_key or x_api_key == "demo-api-key":
        pass
    else:
        # TODO: Validate API key
        pass
    
    # TODO: In Phase 4, integrate with API Gateway
    # For now, return mock response
    return Collection(
        name=request.name,
        documentCount=0,
        createdAt="2025-01-01T00:00:00Z",
        description=request.description
    )


@router.delete("/{collection_name}")
async def delete_collection(
    collection_name: str,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Delete a collection
    
    This endpoint proxies to the API Gateway
    """
    # Validate API key
    if not x_api_key or x_api_key == "demo-api-key":
        pass
    else:
        # TODO: Validate API key
        pass
    
    # TODO: In Phase 4, integrate with API Gateway
    # For now, return success
    return {"success": True, "message": f"Collection '{collection_name}' deleted"}

