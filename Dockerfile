# Multi-stage build for IntraMind Web UI
# Stage 1: Build widget
FROM node:18-alpine AS widget-builder

WORKDIR /app/widget

# Copy widget package files
COPY widget/package*.json ./

# Install dependencies
RUN npm ci

# Copy widget source
COPY widget/ ./

# Build widget
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built widget from previous stage
COPY --from=widget-builder /app/widget/dist ./widget/dist

# Expose port
EXPOSE 8001

# Set working directory to backend
WORKDIR /app/backend

# Run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

