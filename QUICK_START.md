# Quick Start Guide - IntraMind Web UI

> Fast reference for getting up and running

## 📦 What You Have

A complete embeddable widget structure ready for development:
- **Widget**: Preact + TypeScript (frontend)
- **Backend**: FastAPI (API server)
- **Demo**: HTML demo page
- **Docs**: Comprehensive roadmap and guides

## 🚀 Next 3 Commands

```bash
# 1. Push to GitHub (after creating repo)
cd C:\Users\JessK\source\repos\IntraMind\web-ui
git add -A
git commit -m "Initial web UI structure"
git remote add origin https://github.com/JessKelly91/intramind-web-ui.git
git push -u origin main

# 2. Add as submodule (from IntraMind root)
cd C:\Users\JessK\source\repos\IntraMind
Remove-Item -Recurse -Force web-ui
git submodule add https://github.com/JessKelly91/intramind-web-ui.git web-ui

# 3. Install dependencies
cd web-ui\widget
npm install
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

## 🎯 Development Phases

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 0 | Setup | 1 hour | ✅ Done |
| 1 | Infrastructure | 1 day | ⏳ Next |
| 2 | Chat UI | 2 days | 🔜 |
| 3 | Upload | 1 day | 🔜 |
| 4 | Collections | 1 day | 🔜 |
| 5 | Config | 1 day | 🔜 |
| 6 | Polish | 1 day | 🔜 |
| 7 | Docker | 0.5 day | 🔜 |
| 8 | Docs | 1 day | 🔜 |

## 🔥 Phase 1 Checklist (Day 1)

### Backend (30 mins)
- [ ] `cd backend`
- [ ] `python -m venv venv`
- [ ] `.\venv\Scripts\activate`
- [ ] `pip install -r requirements.txt`
- [ ] `python main.py` → Test at http://localhost:8001

### Frontend (45 mins)
- [ ] `cd widget`
- [ ] `npm install`
- [ ] `npm run dev` → Test at http://localhost:5173
- [ ] Build test: `npm run build`

### Integration (30 mins)
- [ ] Implement Shadow DOM wrapper
- [ ] Test widget loads in demo page
- [ ] Verify no style conflicts

## 📖 Key Documentation

| File | Purpose |
|------|---------|
| `README.md` | Overview & features |
| `UI_ROADMAP.md` | Detailed 8-phase plan |
| `SETUP_INSTRUCTIONS.md` | GitHub setup steps |
| `PHASE_0_COMPLETE.md` | What's been done |
| `QUICK_START.md` | This file! |

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

## 📞 Quick Commands

```bash
# Backend
cd backend
python main.py              # Run server
python -m pytest            # Run tests

# Frontend  
cd widget
npm run dev                 # Dev server
npm run build              # Production build
npm run preview            # Preview build

# Docker (later)
docker-compose up --build  # Run all services
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

## 📈 Progress Tracking

Track your progress in `UI_ROADMAP.md` (gitignored)

Update the Daily Log section after each work session:
- Time spent
- Completed tasks
- Blockers
- Next steps

## 🎯 Current Goal

**Get Phase 1 running:**
1. Backend responding at port 8001
2. Frontend dev server at port 5173
3. Widget loads in demo page
4. Ready for Phase 2 (chat UI)

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 10, 2025  
**Status**: Phase 0 Complete → Phase 1 Ready

