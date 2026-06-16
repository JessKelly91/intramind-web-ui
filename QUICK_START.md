# Quick Start Guide - IntraMind Web UI

> Fast reference for running the current embeddable widget and FastAPI backend.

## Current Status

The web-ui is already checked in as an IntraMind submodule. It includes:

- **Widget**: Preact + TypeScript embeddable chat widget
- **Backend**: FastAPI API server for chat, uploads, collections, and widget serving
- **Demo**: Static HTML page showing script-tag integration

The remaining work is automation and packaging: root Docker Compose does not yet run the web-ui, and frontend/backend tests are not enforced in CI.

## Quick Local Run

Start the main IntraMind services from the repository root first:

```powershell
docker compose up -d
```

Then run the web-ui backend:

```powershell
cd web-ui\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

In another terminal, run the widget dev server:

```powershell
cd web-ui\widget
npm install
npm run dev
```

Open `web-ui/demo-site/index.html` in a browser, or serve it locally:

```powershell
cd web-ui\demo-site
python -m http.server 8080
```

## 📋 File Structure at a Glance

```
web-ui/
├── widget/              # Preact frontend
│   ├── src/
│   │   ├── index.ts    # Entry: IntraMind.init()
│   │   ├── App.tsx     # Main component
│   │   └── types/      # TypeScript types
│   └── package.json
├── backend/             # FastAPI backend
│   ├── main.py         # FastAPI app
│   └── requirements.txt
├── demo-site/
│   └── index.html      # Demo page
└── UI_ROADMAP.md       # Detailed plan (gitignored)
```

## Current Capabilities

| Area | Status |
|------|--------|
| Chat UI | Implemented |
| Document upload | Implemented |
| Collection browser | Implemented |
| API-key auth | Implemented |
| Tenant collection namespacing | Implemented |
| Rate limiting | Implemented in backend memory |
| Docker image | Present, but needs validation in root compose |
| Automated tests | Not yet enforced |

## 💡 Usage Example (End Goal)

```html
<!-- Add to any website -->
<script src="https://cdn.intramind.io/widget.js"></script>
<script>
  IntraMind.init({
    apiKey: 'sk_live_...',
    collection: 'docs',
    theme: 'light'
  });
</script>
```

## 🎨 Widget Features

- ✅ **Chat**: Conversational search
- ✅ **Upload**: Document ingestion
- ✅ **Collections**: Browse & manage
- ✅ **Customizable**: Theme, colors, position
- ✅ **Secure**: API key auth
- ✅ **Small**: ~30KB bundle

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Preact 10 + TypeScript |
| Build | Vite 5 |
| Backend | FastAPI + Python 3.11+ |
| Styling | Shadow DOM + CSS |
| Deploy | Docker |

## Quick Commands

```bash
# Backend
cd backend
uvicorn main:app --reload --port 8001

# Frontend  
cd widget
npm run dev                 # Dev server
npm run build              # Production build
npm run preview            # Preview build

# Docker for this submodule
docker compose up --build
```

## 🐛 Troubleshooting

### npm install fails
```bash
npm cache clean --force
npm install
```

### Python deps fail
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Vite build fails
```bash
# Check Node version (need 18+)
node --version

# Delete and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## 🎓 Learning Resources

- [Preact Docs](https://preactjs.com/)
- [Vite Docs](https://vitejs.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Shadow DOM Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

## Current Gaps

Before treating the web-ui as public-release ready:

1. Add frontend and backend automated tests.
2. Wire build/type-check/test steps into CI.
3. Validate the Docker image path to `ai-agent` imports, healthcheck tools, and root compose integration.
4. Refresh or consolidate any remaining phase-history docs into `docs/archive/`.

---

**Quick Reference Version**: 1.0  
**Last Updated**: June 16, 2026  
**Status**: Feature-complete demo; automation and Docker integration still in progress

