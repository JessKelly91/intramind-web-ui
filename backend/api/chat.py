"""
Chat API endpoints
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    collection: str
    conversationId: Optional[str] = None


class SearchResult(BaseModel):
    id: str
    title: str
    content: str
    score: float
    metadata: dict


class ChatResponse(BaseModel):
    response: str
    citations: List[SearchResult]
    conversationId: str
    queryComplexity: Optional[str] = None


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Send a chat message and get AI-powered response
    
    This endpoint proxies to the AI Agent service
    """
    # TODO: In Phase 2, integrate with AI Agent
    # For now, return a placeholder response
    
    # Validate API key (placeholder - will be implemented properly)
    if not x_api_key or x_api_key == "demo-api-key":
        # In development, allow demo key
        pass
    else:
        # TODO: Validate API key against database/service
        pass
    
    # TODO: Call AI Agent search workflow
    # For Phase 1, return mock response
    return ChatResponse(
        response=f"Thank you for your query: '{request.query}'. Full chat functionality will be available in Phase 2!",
        citations=[],
        conversationId=request.conversationId or "demo-conversation-id",
        queryComplexity="simple"
    )

