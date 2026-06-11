"""
IntraMind Web UI Backend
FastAPI application serving the embeddable widget and API endpoints
"""

import logging
import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Make the AI Agent's `utils.observability` importable so we share the same
# idempotent init_tracing implementation across services.
_AI_AGENT_SRC = os.path.join(
    os.path.dirname(__file__), "..", "..", "ai-agent", "src"
)
if _AI_AGENT_SRC not in sys.path:
    sys.path.insert(0, _AI_AGENT_SRC)

# Import API routers
# Note: Run with `uvicorn main:app` from the backend directory
# Or set PYTHONPATH: `PYTHONPATH=. uvicorn backend.main:app`
from api import chat, upload, collections, validate
from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title="IntraMind Web UI API",
    description="Backend API for IntraMind embeddable chat widget",
    version="0.1.0"
)

# CORS configuration.
# Origins are driven by WEB_UI_CORS_ALLOWED_ORIGINS (comma-separated). We never
# combine a wildcard origin with credentials (the browser rejects that, and it
# is unsafe). In dev mode we fall back to common localhost origins if none are
# explicitly configured; otherwise an empty list means no cross-origin access.
_cors_origins = settings.cors_origins_list
if not _cors_origins and settings.auth_dev_mode:
    _cors_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8001",
        "http://127.0.0.1:5173",
    ]
    logger.warning(
        "WEB_UI_CORS_ALLOWED_ORIGINS not set; using localhost dev defaults "
        "because WEB_UI_AUTH_DEV_MODE is on."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# Include API routers
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(collections.router)
app.include_router(validate.router)


@app.on_event("startup")
async def _init_observability() -> None:
    """Initialize OTEL tracing and instrument FastAPI + HTTPX.

    Reads ENABLE_TRACING, PHOENIX_ENDPOINT, and TRACING_SERVICE_NAME directly
    from the environment to avoid coupling to the AI Agent's pydantic Settings.
    The underlying init_tracing call is idempotent.
    """
    enabled = os.environ.get("ENABLE_TRACING", "").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    if not enabled:
        logger.debug("Tracing disabled in web-ui backend (ENABLE_TRACING not truthy)")
        return

    endpoint = os.environ.get("PHOENIX_ENDPOINT", "http://localhost:6006")
    service_name = os.environ.get("TRACING_SERVICE_NAME", "intramind-web-ui")

    try:
        from utils.observability import init_tracing
    except ImportError as exc:
        logger.warning("Could not import shared observability module: %s", exc)
        return

    init_tracing(service_name=service_name, endpoint=endpoint, enabled=True)

    # Instrument FastAPI so every /api/* request becomes a parent span.
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        FastAPIInstrumentor.instrument_app(app)
    except ImportError as exc:
        logger.warning("opentelemetry-instrumentation-fastapi not installed: %s", exc)
    except Exception as exc:
        logger.warning("Failed to instrument FastAPI: %s", exc)

    # Instrument HTTPX so APIGatewayClient calls in chat.py / collections.py
    # produce child spans linked to the FastAPI parent via context propagation.
    try:
        from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

        HTTPXClientInstrumentor().instrument()
    except ImportError as exc:
        logger.warning("opentelemetry-instrumentation-httpx not installed: %s", exc)
    except Exception as exc:
        logger.warning("Failed to instrument HTTPX: %s", exc)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "IntraMind Web UI API",
        "version": "0.1.0",
        "status": "ready",
        "endpoints": {
            "chat": "/api/chat",
            "upload": "/api/upload",
            "collections": "/api/collections",
            "validate": "/api/validate",
            "widget": "/widget.js",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "web-ui-backend"}


@app.get("/widget.js")
async def serve_widget():
    """
    Serve the widget JavaScript bundle

    In production, this should serve from a CDN or static file server.
    For development, serves from the build output.
    """
    widget_path = os.path.join(os.path.dirname(__file__), "..", "widget", "dist", "intramind-widget.iife.js")

    if os.path.exists(widget_path):
        return FileResponse(
            widget_path,
            media_type="application/javascript",
            headers={
                "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
            }
        )
    else:
        return {
            "error": "Widget bundle not found",
            "message": "Please build the widget first: cd widget && npm run build",
            "path": widget_path
        }, 404


