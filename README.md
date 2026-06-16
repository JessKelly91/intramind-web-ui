# IntraMind Web UI - Embeddable Chat Widget

> Embeddable chat widget for enterprise knowledge base search - Add AI-powered document search to any website with a simple script tag.

## 🎯 Overview

IntraMind Web UI is an embeddable chat widget that brings conversational AI search to any website. Designed for internal enterprise tools, admin panels, and intranets, it provides instant access to your organization's knowledge base.

## ✨ Features

- 💬 **Conversational Search** - Natural language queries with AI-powered responses
- 📤 **Document Upload** - Drag-and-drop document ingestion directly in the widget
- 📁 **Collection Management** - Browse and manage document collections
- 🎨 **Customizable** - Theme colors, position, and features via configuration API
- 🔐 **Secure** - API key authentication with rate limiting
- 📦 **Lightweight** - ~30KB gzipped bundle (Preact-based)
- 🎭 **Isolated** - Shadow DOM prevents style conflicts with host site

## 🚀 Quick Start

Add IntraMind to any website with two lines of code:

```html
<script src="https://your-domain.com/intramind-widget.js"></script>
<script>
  IntraMind.init({
    apiKey: 'your-api-key',
    collection: 'company-docs'
  });
</script>
```

## 🏗️ Architecture

```
┌─────────────────────┐
│   Host Website      │
│   <script>          │  ← Embed anywhere
└──────────┬──────────┘
           │ JavaScript SDK
           ▼
┌─────────────────────┐
│  Widget Backend     │  ← FastAPI (Port 8001)
│  - Chat API         │
│  - Auth/API Keys    │
│  - File Upload      │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  AI Agent           │  ← Existing IntraMind Agent
│  - Search Workflow  │
│  - Ingestion        │
└──────────┬──────────┘
           │
           ▼
   [API Gateway → Vector Service → Weaviate]
```

## 📁 Project Structure

```
web-ui/
├── widget/                    # Frontend widget (Preact + TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── styles/           # CSS
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                   # Backend API (FastAPI)
│   ├── api/                  # API routes
│   ├── services/             # Business logic
│   ├── models/               # Data models
│   ├── main.py
│   └── requirements.txt
│
├── demo-site/                 # Demo HTML page
│   └── index.html            # Shows widget integration
│
├── docs/                      # Documentation
│
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # Local development
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Frontend Widget
- **Framework**: Preact (lightweight React alternative)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Shadow DOM + CSS Modules
- **Bundle Size**: ~30KB gzipped

### Backend
- **Framework**: FastAPI (Python)
- **Authentication**: API Key validation
- **Features**: Chat proxy, file upload, collections API

### Integration
- **AI Agent**: Existing IntraMind AI Agent (LangGraph)
- **Communication**: REST API + WebSocket (for streaming)

## 📖 Configuration API

```javascript
IntraMind.init({
  // Required
  apiKey: 'your-api-key',
  
  // Optional customization
  position: 'bottom-right',          // Widget position
  theme: 'light',                    // 'light' | 'dark'
  primaryColor: '#4F46E5',          // Brand color
  collection: 'default',             // Default collection to search
  
  // Feature toggles
  features: {
    chat: true,                      // Enable chat
    upload: true,                    // Enable document upload
    collections: true                // Enable collection browser
  },
  
  // Text customization
  placeholder: 'Ask a question...',
  welcomeMessage: 'How can I help you?'
});
```

## 🧑‍💻 Development

### Prerequisites
- Node.js 18+ (for widget development)
- Python 3.11+ (for backend)
- Docker & Docker Compose

### Local Development

**1. Install Dependencies**

```bash
# Frontend
cd widget
npm install

# Backend
cd backend
pip install -r requirements.txt
```

**2. Run Development Servers**

```bash
# Frontend (Vite dev server)
cd widget
npm run dev

# Backend (FastAPI with auto-reload)
cd backend
uvicorn main:app --reload --port 8001
```

**3. Open Demo Site**

Open `demo-site/index.html` in your browser to see the widget in action.

### Docker Development

```bash
# Build and run all services
docker-compose up --build

# Widget will be available at http://localhost:8001
```

## 🚢 Deployment

### Production Build

```bash
# Build widget bundle
cd widget
npm run build

# Widget bundle will be in widget/dist/intramind-widget.js
```

### Docker Deployment

The widget backend serves both the JavaScript bundle and API endpoints:

```bash
# Build production image
docker build -t intramind-web-ui .

# Run container
docker run -p 8001:8001 \
  -e AI_AGENT_URL=http://ai-agent:8000 \
  intramind-web-ui
```

### Integration with Main Platform

Add to main IntraMind `docker-compose.yml`:

```yaml
services:
  web-ui:
    build: ./web-ui
    ports:
      - "8001:8001"
    environment:
      - AI_AGENT_URL=http://ai-agent:8000
    depends_on:
      - ai-agent
```

## 📚 Documentation

- [Quick Start](./QUICK_START.md) - Current local setup and run commands
- [Testing Guide](./TESTING_GUIDE.md) - Manual smoke tests for widget and backend behavior
- [Archived Phase History](./docs/archive/PHASE_HISTORY.md) - Historical implementation milestones

## 🧪 Testing

```bash
# Frontend tests
cd widget
npm test

# Backend tests
cd backend
pytest

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

This is a portfolio project, but feedback is welcome!

## 📄 License

Part of the IntraMind platform - see main repository for license.

## 🔗 Related Repositories

- [IntraMind Platform](https://github.com/JessKelly91/IntraMind) - Main platform repository
- [AI Agent](https://github.com/JessKelly91/intramind-ai-agent) - AI agent service
- [API Gateway](https://github.com/JessKelly91/intramind-api-gateway) - REST API gateway
- [Vector Service](https://github.com/JessKelly91/ai-vector-db-practice) - Vector database service

---

**Built as part of the IntraMind platform**

