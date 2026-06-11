"""Chat API endpoints - Proxies to AI Agent (tenant-scoped)."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
import os
import sys
import logging

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

from auth import require_tenant
from tenancy import Tenant

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Active conversation threads, keyed by "<tenant_id>:<conversationId>" so one
# tenant can never resume or read another tenant's conversation memory.
conversation_threads = {}


def _thread_key(tenant: Tenant, conversation_id: str) -> str:
    return f"{tenant.tenant_id}:{conversation_id}"


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


class SafetyFlag(BaseModel):
    """Output safety metadata when Llama Guard hard-blocks a response.

    Surfaced so the widget *could* render a generic blocked banner. The
    original (flagged) response is never included; ``response`` already
    contains the templated fallback text.
    """

    flagged: bool
    categories: List[str] = []
    checked_at: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    citations: List[SearchResult]
    conversationId: str
    queryComplexity: Optional[str] = None
    safetyFlag: Optional[SafetyFlag] = None


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    tenant: Tenant = Depends(require_tenant),
):
    """Send a chat message and get an AI-powered response.

    The request is authenticated and rate-limited by ``require_tenant`` and is
    scoped to the calling tenant's collection namespace.
    """
    namespaced_collection = tenant.namespaced(request.collection)

    # If AI Agent is not available, return mock response
    if not AI_AGENT_AVAILABLE:
        return ChatResponse(
            response=f"Thank you for your query: '{request.query}'. AI Agent is not currently available. Please ensure the AI Agent is properly configured.",
            citations=[],
            conversationId=request.conversationId or "demo-conversation-id",
            queryComplexity="simple"
        )

    try:
        # Get or create a tenant-isolated conversation thread.
        conversation_id = request.conversationId or f"conv_{os.urandom(8).hex()}"
        thread_key = _thread_key(tenant, conversation_id)

        if thread_key in conversation_threads:
            agent = conversation_threads[thread_key]
        else:
            # Prefix the agent's checkpoint thread_id with the tenant so the
            # underlying LangGraph memory is isolated per tenant as well.
            agent = IntraMindAgent(thread_id=thread_key)
            conversation_threads[thread_key] = agent
            logging.info(f"Created new conversation thread: {thread_key}")

        logging.info(
            f"Processing query for tenant '{tenant.tenant_id}': {request.query} "
            f"(collection: {namespaced_collection})"
        )
        result = await agent.search(
            query=request.query,
            collection_name=namespaced_collection,
            num_results=5,
            min_score=0.3
        )

        # Extract response and citations
        response_text = result.get("final_response", "I couldn't find relevant information for your query.")
        search_results = result.get("search_results", [])
        query_complexity = result.get("query_classification", {}).get("complexity", "unknown")

        # Map search results to citations (display the un-namespaced collection)
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

        # Surface output safety metadata (Step 4: Llama Guard). When flagged,
        # the agent has already replaced the response with a templated
        # fallback and discarded citations - we just expose the metadata so
        # clients can render a generic banner if desired.
        safety_flag_payload: Optional[SafetyFlag] = None
        sf = result.get("safety_flag")
        if isinstance(sf, dict):
            safety_flag_payload = SafetyFlag(
                flagged=bool(sf.get("flagged", False)),
                categories=list(sf.get("categories") or []),
                checked_at=sf.get("checked_at"),
            )

        return ChatResponse(
            response=response_text,
            citations=citations,
            conversationId=conversation_id,
            queryComplexity=query_complexity,
            safetyFlag=safety_flag_payload,
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
    tenant: Tenant = Depends(require_tenant),
):
    """Clear one of the calling tenant's conversation threads."""
    thread_key = _thread_key(tenant, conversation_id)
    if thread_key in conversation_threads:
        del conversation_threads[thread_key]
        return {"status": "success", "message": f"Conversation {conversation_id} cleared"}

    return {"status": "not_found", "message": f"Conversation {conversation_id} not found"}


@router.get("/health")
async def chat_health():
    """Health check for chat endpoint (unauthenticated)."""
    return {
        "status": "healthy",
        "ai_agent_available": AI_AGENT_AVAILABLE,
        "active_conversations": len(conversation_threads)
    }
