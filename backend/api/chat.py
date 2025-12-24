"""
Chat API endpoints - Proxies to AI Agent
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import os
import sys
import logging
import asyncio

# Add AI Agent to Python path
AI_AGENT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai-agent", "src")
if AI_AGENT_PATH not in sys.path:
    sys.path.insert(0, AI_AGENT_PATH)

# Import AI Agent
try:
    from agent.main import IntraMindAgent
    AI_AGENT_AVAILABLE = True
except ImportError as e:
    logging.warning(f"AI Agent not available: {e}. Chat will return mock responses.")
    AI_AGENT_AVAILABLE = False

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Store active conversation threads
conversation_threads = {}


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
    # Validate API key (basic validation for demo)
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")

    # In development, allow demo key
    if x_api_key not in ["demo-api-key", "test-api-key"]:
        # TODO: Implement proper API key validation
        logging.warning(f"Unvalidated API key used: {x_api_key[:10]}...")

    # If AI Agent is not available, return mock response
    if not AI_AGENT_AVAILABLE:
        return ChatResponse(
            response=f"Thank you for your query: '{request.query}'. AI Agent is not currently available. Please ensure the AI Agent is properly configured.",
            citations=[],
            conversationId=request.conversationId or "demo-conversation-id",
            queryComplexity="simple"
        )

    try:
        # Get or create conversation thread
        conversation_id = request.conversationId
        if conversation_id and conversation_id in conversation_threads:
            agent = conversation_threads[conversation_id]
        else:
            # Create new agent instance with conversation memory
            conversation_id = request.conversationId or f"conv_{os.urandom(8).hex()}"
            agent = IntraMindAgent(thread_id=conversation_id)
            conversation_threads[conversation_id] = agent
            logging.info(f"Created new conversation thread: {conversation_id}")

        # Execute search via AI Agent
        logging.info(f"Processing query: {request.query} (collection: {request.collection})")
        result = await agent.search(
            query=request.query,
            collection_name=request.collection,
            num_results=5,
            min_score=0.3
        )

        # Extract response and citations
        response_text = result.get("final_response", "I couldn't find relevant information for your query.")
        search_results = result.get("search_results", [])
        query_complexity = result.get("query_classification", {}).get("complexity", "unknown")

        # Map search results to citations
        citations = []
        for doc in search_results:
            citations.append(SearchResult(
                id=doc.get("id", "unknown"),
                title=doc.get("metadata", {}).get("title", "Document"),
                content=doc.get("content", "")[:200],  # Limit content length
                score=doc.get("score", 0.0),
                metadata={
                    "collection": request.collection,
                    "source": doc.get("metadata", {}).get("source", "Unknown"),
                    "chunk_id": doc.get("metadata", {}).get("chunk_id", ""),
                }
            ))

        logging.info(f"Search completed: {len(citations)} citations found")

        return ChatResponse(
            response=response_text,
            citations=citations,
            conversationId=conversation_id,
            queryComplexity=query_complexity
        )

    except Exception as e:
        logging.error(f"Error processing chat request: {e}", exc_info=True)

        # Return error response with helpful message
        return ChatResponse(
            response=f"I apologize, but I encountered an error processing your request: {str(e)}. Please ensure the IntraMind services are running and try again.",
            citations=[],
            conversationId=request.conversationId or "error-conversation",
            queryComplexity="error"
        )


@router.delete("/conversation/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Clear a conversation thread
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")

    if conversation_id in conversation_threads:
        del conversation_threads[conversation_id]
        return {"status": "success", "message": f"Conversation {conversation_id} cleared"}

    return {"status": "not_found", "message": f"Conversation {conversation_id} not found"}


@router.get("/health")
async def chat_health():
    """
    Health check for chat endpoint
    """
    return {
        "status": "healthy",
        "ai_agent_available": AI_AGENT_AVAILABLE,
        "active_conversations": len(conversation_threads)
    }
