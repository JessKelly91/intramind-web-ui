"""
Collections API endpoints
"""

import os
import sys
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import logging

# Add AI Agent to Python path
AI_AGENT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai-agent", "src")
sys.path.insert(0, AI_AGENT_PATH)

from tools.api_client import APIGatewayClient
import httpx

logger = logging.getLogger(__name__)

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

    try:
        async with APIGatewayClient() as client:
            # Get collections from API Gateway
            collections_response = await client.list_collections()

            # Convert to frontend format
            collections = [
                Collection(
                    name=col.collection_name,
                    documentCount=col.vector_count,
                    createdAt=col.created_at or "2025-01-01T00:00:00Z",
                    description=col.description
                )
                for col in collections_response
            ]

            logger.info(f"✅ Listed {len(collections)} collections")
            return collections

    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Failed to list collections: {e}")
        raise HTTPException(
            status_code=e.response.status_code if e.response else 500,
            detail=f"Failed to list collections: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error listing collections: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


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

    try:
        async with APIGatewayClient() as client:
            # Create collection via API Gateway
            collection_response = await client.create_collection(
                name=request.name,
                description=request.description
            )

            # Convert to frontend format
            collection = Collection(
                name=collection_response.collection_name,
                documentCount=collection_response.vector_count,
                createdAt=collection_response.created_at or "2025-01-01T00:00:00Z",
                description=collection_response.description
            )

            logger.info(f"✅ Created collection: {request.name}")
            return collection

    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Failed to create collection: {e}")
        raise HTTPException(
            status_code=e.response.status_code if e.response else 500,
            detail=f"Failed to create collection: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error creating collection: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
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

    try:
        async with APIGatewayClient() as client:
            # Delete collection via API Gateway
            result = await client.delete_collection(collection_name)

            logger.info(f"✅ Deleted collection: {collection_name}")
            return {"success": True, "message": f"Collection '{collection_name}' deleted"}

    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Failed to delete collection: {e}")
        # If 404, collection doesn't exist
        if e.response and e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Collection '{collection_name}' not found"
            )
        raise HTTPException(
            status_code=e.response.status_code if e.response else 500,
            detail=f"Failed to delete collection: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error deleting collection: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

