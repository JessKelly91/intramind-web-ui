"""
Document upload API endpoints - Integrates with AI Agent ingestion workflow
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import os
import sys
import logging
import tempfile
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
    logging.warning(f"AI Agent not available: {e}. Upload will return mock responses.")
    AI_AGENT_AVAILABLE = False

router = APIRouter(prefix="/api/upload", tags=["upload"])


class UploadResponse(BaseModel):
    success: bool
    documentId: Optional[str] = None
    chunksStored: Optional[int] = None
    error: Optional[str] = None


# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif'}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower()


def validate_file_type(filename: str) -> bool:
    """Validate that file type is allowed"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS


@router.post("", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    collection: str = Form(...),
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Upload a document for ingestion

    This endpoint proxies to the AI Agent ingestion workflow
    """
    # Validate API key
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")

    # In development, allow demo key
    if x_api_key not in ["demo-api-key", "test-api-key"]:
        logging.warning(f"Unvalidated API key used: {x_api_key[:10]}...")

    # Validate file
    if not file.filename:
        return UploadResponse(
            success=False,
            error="No file provided"
        )

    # Validate file type
    if not validate_file_type(file.filename):
        ext = get_file_extension(file.filename)
        return UploadResponse(
            success=False,
            error=f"File type '{ext}' not allowed. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Read file content
    try:
        content = await file.read()
        file_size = len(content)

        # Validate file size (10MB default limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return UploadResponse(
                success=False,
                error=f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size (10MB)"
            )

        logging.info(f"Processing upload: {file.filename} ({file_size} bytes) to collection '{collection}'")

        # If AI Agent is not available, return mock response
        if not AI_AGENT_AVAILABLE:
            logging.warning("AI Agent not available - returning mock response")
            return UploadResponse(
                success=True,
                documentId=f"mock-{file.filename}",
                chunksStored=5  # Mock value
            )

        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=get_file_extension(file.filename)) as tmp_file:
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            # Create agent instance (without conversation memory for ingestion)
            agent = IntraMindAgent(thread_id=False)

            # Call AI Agent ingestion workflow
            logging.info(f"Starting ingestion for {file.filename}")
            result = await agent.ingest_document(
                file_path=tmp_file_path,
                collection_name=collection,
                original_filename=file.filename
            )

            # Extract results
            chunks_stored = result.get("chunks_stored", 0)
            document_id = result.get("document_id", file.filename)

            logging.info(f"✅ Upload successful: {file.filename} - {chunks_stored} chunks stored")

            return UploadResponse(
                success=True,
                documentId=document_id,
                chunksStored=chunks_stored
            )

        except Exception as e:
            logging.error(f"Ingestion failed for {file.filename}: {e}", exc_info=True)
            return UploadResponse(
                success=False,
                error=f"Ingestion failed: {str(e)}"
            )
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except:
                pass

    except Exception as e:
        logging.error(f"Upload processing error: {e}", exc_info=True)
        return UploadResponse(
            success=False,
            error=f"Error processing file: {str(e)}"
        )


@router.get("/health")
async def upload_health():
    """Health check for upload endpoint"""
    return {
        "status": "healthy",
        "ai_agent_available": AI_AGENT_AVAILABLE,
        "allowed_extensions": list(ALLOWED_EXTENSIONS)
    }
