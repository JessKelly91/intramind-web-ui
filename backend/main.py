"""
IntraMind Web UI Backend
FastAPI application serving the embeddable widget and API endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Import API routers
# Note: Run with `uvicorn main:app` from the backend directory
# Or set PYTHONPATH: `PYTHONPATH=. uvicorn backend.main:app`
from api import chat, upload, collections, validate

# Initialize FastAPI app
app = FastAPI(
    title="IntraMind Web UI API",
    description="Backend API for IntraMind embeddable chat widget",
    version="0.1.0"
)

# CORS configuration
# In development, allow all origins. In production, configure specific origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production (use environment variable)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(collections.router)
app.include_router(validate.router)


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
    widget_path = os.path.join(os.path.dirname(__file__), "..", "widget", "dist", "intramind-widget.js")
    
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


