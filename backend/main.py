"""
IntraMind Web UI Backend
FastAPI application serving the embeddable widget and API endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="IntraMind Web UI API",
    description="Backend API for IntraMind embeddable chat widget",
    version="0.1.0"
)

# CORS configuration (will be configured properly in Phase 1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "IntraMind Web UI API",
        "version": "0.1.0",
        "status": "initializing"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Additional routes will be added in Phase 1:
# - /api/chat
# - /api/ingest
# - /api/collections
# - /api/validate

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

