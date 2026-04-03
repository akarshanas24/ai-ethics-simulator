# AI Ethics Simulator

A free, rule-free full-stack application for simulating real-time multi-agent AI ethics debates with live streaming, Judge AI scoring, Chart.js analytics, PDF export, and shareable debate links.

## 🎯 What It Does

1. **User selects** an ethical dilemma scenario
2. **Toggles 2-5 agents** from 5 unique personas (Government Official, Human Rights Advocate, Business Executive, Community Representative, Technical Expert)
3. **FastAPI backend** creates a MongoDB debate record and allocates an SSE queue
4. **Groq Llama 3.1 70B** streams live responses across 3 debate rounds via the backend
5. **Frontend receives SSE events** and renders live chat bubbles in real-time
6. **Judge AI** scores agents on Clarity, Evidence, Ethics, Persuasion (1-10 each)
7. **Results page** displays Chart.js visualizations (bar, radar, line charts), policy recommendation, and full transcript
8. **Export** debate as PDF or generate shareable link

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, Vanilla JS, CSS3, Chart.js |
| **Backend** | FastAPI, Motor (async MongoDB) |
| **AI** | Groq Llama 3.1 70B (streaming SDK) |
| **Database** | MongoDB Atlas (cloud-hosted) |
| **Export** | ReportLab (PDF generation) |
| **Transport** | Server-Sent Events (SSE) for live streaming |

## 🚀 Quick Start (Windows PowerShell)

```powershell
# Run the auto-setup script
.\start.ps1
```

This will:
1. Create Python venv
2. Install dependencies
3. Check configuration
4. Start FastAPI backend (port 8000)
5. Start HTTP server (port 8080)
6. Open frontend in browser

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example and fill in credentials
copy .env.example .env
# Edit .env with MongoDB URI and Groq API key

# Start backend
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
# In project root (new terminal)
python -m http.server 8080
# or: live-server
```

Open `http://localhost:8080`

## 📋 Prerequisites

- Python 3.10+
- MongoDB Atlas account (free tier available)
- Groq API key (free tier: https://console.groq.com)
- Browser (modern ES2020+)

## 🔐 Credentials Setup

### MongoDB Atlas
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/db`
5. Add your IP to IP Whitelist

### Groq API
1. Sign up at https://console.groq.com
2. Generate API key
3. You get free tier credits (~25k requests/month)

Set both in `backend/.env`:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net
DB_NAME=ai_ethics
GROQ_API_KEY=gsk_xxxxx
```

## 📁 Project Structure

```
ai-ethics-project/
├── index.html                 # Frontend entry
├── styles.css                 # All styling + responsive
├── utils.js                   # DOM helpers, navigation, events
├── data.js                    # Scenarios, agents, constants
├── components.js              # Page templates (includes Chart.js rendering)
├── app.js                     # App state, API client, event handlers
├── debate-orchestration.js    # Backend SSE integration
├── start.ps1                  # Quick-start script
│
├── backend/
│   ├── main.py               # FastAPI app
│   ├── database.py           # Motor async MongoDB
│   ├── models.py             # Pydantic schemas
│   ├── groq_client.py        # Real Groq streaming (8x7b fallback)
│   ├── judge.py              # Judge AI + policy synthesis
│   ├── routes/
│   │   └── debates.py        # API endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   └── README.md              # Backend docs
│
├── DEPLOYMENT.md              # Full deployment guide
└── README.md                  # This file
```

## 🔄 Workflow

### Frontend Flow
```
Home → Select Scenario → Configure Agents → Start Debate → Stream Live → Results → Export/Share
```

### Backend Flow
```
POST /debates/
  ↓
POST /debates/{id}/start (background task)
  ↓
Orchestrate 3 Rounds:
  Round 1: generate_round1_opening (Groq streaming)
  Round 2: generate_round2_rebuttal (target opponent)
  Round 3: generate_round3_closing (policy proposals)
  ↓
Judge Scoring (Judge AI or fallback heuristic)
  ↓
MongoDB update + Event: /stream → "finished"
  ↓
GET /debates/{id}/results ← Client fetches results
```

### SSE Event Types
- `{"type": "status", "message": "Round 1...", "round": 1}`
- `{"type": "chunk", "agent": "Name", "text": "...", "round": 1}` (streaming)
- `{"type": "message_done", "agent": "Name", "round": 1}`
- `{"type": "finished", "results": {...}}`

## 📊 Results Visualizations

The results page includes:
- **Bar Chart:** Total scores per agent
- **Radar Chart (Winner):** Detailed criteria breakdown for winner
- **Radar Chart (All):** Compare all agents across criteria
- **Line Chart:** Criteria progression across agents
- **Scoring Grid:** Detailed breakdown table
- **Full Transcript:** Collapsible debate messages
- **Policy Recommendation:** Winner's synthesized proposal

## 💾 PDF Export

Export debate as PDF by clicking "Export as PDF" button. Includes:
- Debate title & scenario
- Full transcript (capped at 20 messages for readability)
- Judge scores & winner
- Policy recommendation

## 🔗 Shareable Links

Click "Share Debate" to copy a shareable URL containing the debate ID:
```
http://localhost:8080?debate=<uuid>
```

(Future: Load debate from ID when landing on shared link)

## ⚙️ Configuration

### Add Custom Scenarios
Edit `data.js`, `INITIAL_SCENARIOS`:
```javascript
{
  id: 'unique-id',
  title: 'Scenario Title',
  description: 'Ethical dilemma description',
  category: 'Technology',
  difficulty: 'Intermediate',
  participants: ['Participant 1', 'Participant 2']
}
```

### Customize Agents
Edit `data.js`, `AGENT_BANK`:
```javascript
{
  name: 'Agent Name',
  role: 'Role',
  avatar: '🎭',
  ethical: 'Ethical stance...',
  framework: 'Ethical framework...',
  personality: 'Personality traits...'
}
```

### Adjust Judge Scoring
Edit `backend/judge.py` to tweak heuristic weights or replace with real Judge AI call via Groq.

## 🧪 Testing

### Local Testing
1. Start both servers (backend + frontend)
2. Navigate to `http://localhost:8080`
3. Go through a full debate workflow
4. Check browser DevTools Network tab for SSE stream
5. Verify chart rendering on results page

### API Testing (curl)

**Create debate:**
```bash
curl -X POST http://localhost:8000/debates/ \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {"id": "test", "title": "Test", "description": "Test scenario"},
    "agent_indices": [0, 1, 2],
    "agents": [{"name": "Agent 1", "role": "Role 1"}, ...]
  }'
```

**Start debate:**
```bash
curl -X POST http://localhost:8000/debates/{debate_id}/start
```

**Stream:**
```bash
# Use `curl` with `-N` flag to disable buffering
curl -N http://localhost:8000/debates/{debate_id}/stream
```

**Get results:**
```bash
curl http://localhost:8000/debates/{debate_id}/results
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS error** | Ensure FastAPI CORS middleware is enabled (default) |
| **MongoDB connection failed** | Check `.env` credentials; whitelist your IP in MongoDB Atlas |
| **Groq API error** | Verify API key in `.env`; check account has requests remaining |
| **SSE not streaming** | Verify backend running; check Network tab in DevTools for `/stream` connection |
| **Charts not rendering** | Ensure Chart.js loaded; check browser console for errors |
| **PDF export fails** | Ensure ReportLab installed (`pip install reportlab`) |

## 📈 Scaling & Deployment

### Single-Process (Development)
- In-memory asyncio.Queue per debate ✅
- Suitable for testing / small users

### Multi-Process (Production)
- Replace in-memory queue with **Redis Pub/Sub** or **Kafka**
- Deploy backend to Render, Railway, Google Cloud Run
- Deploy frontend to Vercel, Netlify, or S3 + CloudFront
- Update `API_BASE` to production backend URL

### Database Scaling (MongoDB)
- MongoDB Atlas auto-scales on free/paid tiers
- Enable backups in Atlas console
- Monitor usage via Atlas dashboard

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Cloud hosting options
- Environment setup checklists
- Performance tuning
- Monitoring & logging

## 📝 License

**Unlicensed / No Rules** – Use freely, modify, deploy, commercialize without restrictions.

## ✨ Features Implemented

✅ Full-stack web app (HTML5 + Vanilla JS)
✅ Real Groq Llama 3.1 70B streaming
✅ Live SSE message streaming
✅ MongoDB persistence
✅ Judge AI scoring (with heuristic fallback)
✅ Chart.js visualizations (4 chart types)
✅ PDF export
✅ Shareable debate links
✅ Responsive CSS3 design
✅ 5 AI agent personalities
✅ 3-round debate orchestration
✅ Policy recommendation synthesis
✅ Full transcript viewing
✅ Admin environment setup

## 🤝 Contributing

Pull requests welcome. For major changes, open an issue first.

## 📧 Contact / Support

For questions or issues, open a GitHub Issue or contact the maintainers.

---

**Built with ❤️ for AI ethics exploration** 🤖
