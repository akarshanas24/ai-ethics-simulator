# 🚀 AI Ethics Simulator - Integration Checklist

Complete this checklist to get the full system running end-to-end.

## Phase 1: Prerequisites ✅ (10 min)

- [ ] Python 3.10+ installed (`python --version`)
- [ ] Node.js 16+ (optional for `live-server`)
- [ ] MongoDB Atlas account created
- [ ] Groq account created with API key generated

## Phase 2: Environment Setup (5 min)

### Backend Configuration
- [ ] Copy `backend/.env.example` → `backend/.env`
- [ ] Get MongoDB URI:
  - [ ] Log into MongoDB Atlas
  - [ ] Click "Connect" on your cluster
  - [ ] Select "Drivers" → copy connection string
  - [ ] Replace `<username>`, `<password>`, `<database>` with actual values
  - [ ] Paste into `backend/.env` as `MONGO_URI`
- [ ] Get Groq API key:
  - [ ] Log into https://console.groq.com
  - [ ] Navigate to "API Keys"
  - [ ] Create/copy existing key
  - [ ] Paste into `backend/.env` as `GROQ_API_KEY`

**Example `.env`:**
```env
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/ai_ethics
DB_NAME=ai_ethics
GROQ_API_KEY=gsk_abcdef123456
```

## Phase 3: Backend Setup (5 min)

- [ ] Navigate to project root in terminal
- [ ] Create venv: `python -m venv backend\.venv`
- [ ] Activate: `backend\.venv\Scripts\activate` (Windows) or `source backend/.venv/bin/activate` (Mac/Linux)
- [ ] Install: `pip install -r backend/requirements.txt`
- [ ] Test DB connection: `python -c "from motor.motor_asyncio import AsyncIOMotorClient; print('Motor OK')"`
- [ ] Test Groq: `python -c "from groq import Groq; print('Groq OK')"`

## Phase 4: Start Services (5 min)

### Option A: Automated (Fast)
- [ ] Run: `.\start.ps1` (Windows PowerShell)
- [ ] Let script complete (creates venv, installs, starts both servers)
- [ ] Browser opens to frontend automatically

### Option B: Manual (Control)

**Terminal 1 - Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
# Wait for: "Application startup complete"
```

**Terminal 2 - Frontend:**
```bash
python -m http.server 8080
# Visit: http://localhost:8080
```

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:8080`
- [ ] Browser open and showing home page

## Phase 5: End-to-End Test (10 min)

1. [ ] **Home Page**
   - [ ] See hero section with "Begin Simulation"
   - [ ] See "Why AI Ethics Matters" features
   - [ ] See "How It Works" stepper

2. [ ] **Scenario Selection**
   - [ ] Click "Start Simulation" → navigate to scenarios
   - [ ] See search bar (no overlap with icon)
   - [ ] See category chips
   - [ ] Click on a scenario → select it

3. [ ] **Agent Configuration**
   - [ ] See all 5 agents with descriptions
   - [ ] Toggle 2-5 agents (checkboxes work)
   - [ ] See count update: "X selected"
   - [ ] Click "Start Debate" button

4. [ ] **Live Debate**
   - [ ] Debate page loads with scenario title
   - [ ] Messages stream in live (SSE working)
   - [ ] Chat bubbles appear with agent names
   - [ ] Messages group by round
   - [ ] Auto-scrolls to latest message
   - [ ] No JavaScript errors in console

5. [ ] **Results Page**
   - [ ] Winner card displays
   - [ ] Charts render (bar, radar, line)
   - [ ] Scores table shows all agents
   - [ ] Transcript expandable
   - [ ] Buttons work: PDF export, Share, New Debate

6. [ ] **Export & Share**
   - [ ] Click "Export as PDF" → download works
   - [ ] Click "Share Debate" → URL copied (check console)
   - [ ] Click "Start New Debate" → back to home

## Phase 6: Verify Data Persistence (2 min)

- [ ] Open MongoDB Atlas console
- [ ] Navigate: `ai_ethics` database → `debates` collection
- [ ] [ ] See new debate document
- [ ] See `_id`, `scenario`, `agents`, `messages`, `results` fields
- [ ] [ ] Navigate to `messages` collection
- [ ] See debate messages indexed

## Phase 7: Advanced Checks (Optional)

### Backend Logs
- [ ] No errors in FastAPI terminal
- [ ] No warnings in motor/Groq logs

### Browser DevTools
- [ ] Network tab: `/stream` is an EventStream
- [ ] Console: no errors or warnings
- [ ] Application tab: LocalStorage intact (if used)

### API Direct Testing (curl/Postman)
```bash
# Create debate
curl -X POST http://localhost:8000/debates/ \
  -H "Content-Type: application/json" \
  -d '{"scenario": {...}, "agent_indices": [0,1,2], "agents": [...]}'

# Get results
curl http://localhost:8000/debates/{debate_id}/results
```

## 🎯 Troubleshooting by Phase

### Phase 2: Env Issues
| Error | Fix |
|-------|-----|
| `MONGO_URI not set` | Copy `.env.example`, edit with real values |
| MongoDB connection fails | Whitelist your IP in MongoDB Atlas → Network Access |
| `GROQ_API_KEY invalid` | Regenerate key at console.groq.com |

### Phase 3: Dependency Issues
| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: motor` | `pip install -r requirements.txt` |
| `SyntaxError` in main.py | Verify Python 3.10+ installed |
| `port 8000 already in use` | Change port: `uvicorn main:app --port 9000` |

### Phase 4: Startup Issues
| Error | Fix |
|-------|-----|
| Backend won't start | Check `.env` is valid → test DB connection separately |
| Frontend won't load | Verify `python -m http.server` output shows `Serving...` |
| CORS error in console | Backend CORS middleware should be enabled by default |

### Phase 5: Runtime Issues
| Error | Fix |
|-------|-----|
| Messages not streaming | Check Network tab for `/stream` → verify backend console shows no errors |
| Charts not rendering | Open DevTools console → check for Chart.js errors |
| PDF export fails | `pip install reportlab` → restart backend |

## ✅ Success Checklist

When complete, you have:
- ✅ Frontend (HTML5/Vanilla JS) at `http://localhost:8080`
- ✅ Backend (FastAPI) at `http://localhost:8000`
- ✅ MongoDB Atlas storing debates
- ✅ Groq Llama 3.1 70B streaming live responses
- ✅ Chart.js analytics on results
- ✅ PDF export functionality
- ✅ Shareable debate links
- ✅ Full end-to-end AI ethics simulation

## 🎓 Next Steps

- Customize scenarios in `data.js`
- Add more agent personas
- Tune Judge heuristics in `backend/judge.py`
- Deploy to production (see DEPLOYMENT.md)
- Share debates via generated links
- Collect debate data for research

---

**Questions?** Check DEPLOYMENT.md or backend/README.md

**Ready?** Run `.\start.ps1` and start simulating! 🚀
