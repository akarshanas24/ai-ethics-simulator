# AI Ethics Simulator - Complete Deployment Guide

A full-stack application for simulating AI ethics debates with Groq Llama 3.1 70B, real-time SSE streaming, MongoDB persistence, Chart.js analytics, and PDF export.

## Tech Stack

- **Frontend:** HTML5 + Vanilla JS + CSS3 + Chart.js
- **Backend:** FastAPI + Motor (async MongoDB)
- **AI:** Groq Llama 3.1 70B (streaming via Groq SDK)
- **Database:** MongoDB Atlas
- **Export:** ReportLab (PDF generation)

## Project Structure

```
ai-ethics-project/
├── index.html                 # Frontend entry point
├── styles.css                 # All styling (responsive, Charts)
├── utils.js                   # DOM helpers, navigation, event emitters
├── data.js                    # Scenarios, agents, constants
├── components.js              # Page rendering templates (with Chart.js)
├── app.js                     # Main app controller, AppState, API client
├── debate-orchestration.js    # Backend SSE integration, real debate flow
│
├── backend/
│   ├── __init__.py           # Package marker
│   ├── main.py               # FastAPI app, CORS, startup/shutdown
│   ├── database.py           # Motor MongoDB client
│   ├── models.py             # Pydantic request/response models
│   ├── groq_client.py        # Real Groq Llama streaming (8x7b fallback)
│   ├── judge.py              # Judge AI heuristic + policy synthesis
│   ├── routes/
│   │   └── debates.py        # API endpoints: create, start, stream, results, export-pdf
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   └── README.md              # Backend-specific setup
```

## Environment Setup

### Prerequisites

- Python 3.10+
- Node.js 16+ (optional, for live-server)
- MongoDB Atlas account
- Groq API key (get free tier: https://console.groq.com)

### Backend Setup

1. **Create virtual environment:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# or: source .venv/bin/activate  # macOS/Linux
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment (.env file):**

```bash
# Create .env from template
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://user:password@your-cluster.mongodb.net
DB_NAME=ai_ethics
GROQ_API_KEY=your_groq_api_key_here
```

**Get these credentials:**
- **MongoDB Atlas:** Sign up at mongodb.com, create cluster, get connection string
- **Groq API Key:** Sign up at console.groq.com, generate API key

4. **Start backend:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Serve frontend (Windows PowerShell):**

```powershell
python -m http.server 8000 --directory .
```

or install live-server:

```bash
npm install -g live-server
live-server
```

Frontend will open at `http://localhost:8000` (or port shown)

## Workflow

### User Journey

1. **Home Page:** Select "Begin Simulation"
2. **Scenario Selection:** Pick an ethical dilemma or create custom
3. **Agent Config:** Select 2-5 AI agents from 5 personality roles
4. **Debate:** Watch real-time streaming debate across 3 rounds
   - Round 1: Opening arguments
   - Round 2: Targeted rebuttals
   - Round 3: Policy proposals
5. **Results:** View Judge AI scoring, Charts, policy recommendation
6. **Export:** PDF download or shareable link

### Behind the Scenes

1. **Frontend sends POST /debates/**: Creates debate record, allocates SSE queue
2. **Frontend sends POST /debates/{id}/start**: Backend queues background task
3. **Backend orchestrates 3 rounds**:
   - For each round, for each agent: Stream Groq response via SSE
   - Each chunk yields to frontend as chat bubble
   - Store messages in MongoDB
4. **Judge AI scores**: Groq judge or heuristic fallback
5. **Frontend receives `/stream` events**:
   - `status`: Round title
   - `chunk`: Text fragment (builds live bubble)
   - `message_done`: Agent message complete
   - `finished`: All results available
6. **Results page renders**: Charts from judge scores, full transcript

## API Endpoints

### Create Debate
**POST /debates/**
```json
{
  "scenario": { "id": "...", "title": "...", "description": "..." },
  "agent_indices": [0, 1, 2],
  "agents": [ { "name": "...", "role": "...", ... } ]
}
```
**Response:** `{ "debate_id": "uuid" }`

### Start Debate
**POST /debates/{debate_id}/start**

Triggers 3-round orchestration in background.

**Response:** `{ "status": "starting" }`

### Stream Messages (SSE)
**GET /debates/{debate_id}/stream**

Subscribe to real-time events (Server-Sent Events):
- `{"type": "status", "message": "Round 1..."}`
- `{"type": "chunk", "agent": "...", "text": "..."}`
- `{"type": "message_done", ...}`
- `{"type": "finished", "results": {...}}`

### Get Results
**GET /debates/{debate_id}/results**

**Response:**
```json
{
  "debate_id": "uuid",
  "status": "finished",
  "results": {
    "judge_result": { "winner": "...", "scores": {...} },
    "policy": { "title": "...", "body": "..." },
    "transcript": [...]
  }
}
```

### Export PDF
**POST /debates/{debate_id}/export-pdf**

Downloads PDF file containing debate transcript, scores, and policy.

## Configuration

### Agents (in data.js)
Edit `AGENT_BANK` to add/remove personalities:

```javascript
{
  name: "Agent Name",
  role: "Role",
  avatar: "emoji",
  ethical: "...",
  framework: "Ethical framework...",
  personality: "..."
}
```

### Scenarios (in data.js)
Edit `INITIAL_SCENARIOS` to add pre-built dilemmas.

### Judge Scoring
Edit `backend/judge.py` to adjust heuristic weights or replace with real Judge AI.

## Troubleshooting

### CORS Error
Ensure `backend/main.py` includes CORS middleware (it does by default).

### MongoDB Connection Failed
- Check `.env` credentials
- Whitelist your IP in MongoDB Atlas IP Access List
- Test connection: `python -c "from pymongo import MongoClient; print(MongoClient('...uri...')['admin'].command('ping'))"`

### Groq API Error
- Verify API key in `.env`
- Check Groq account has requests remaining
- Test: `python -c "from groq import Groq; print(Groq().models.list())"`

### SSE Not Streaming
- Verify backend is running on port 8000
- Check browser DevTools Network tab for `/stream` connection
- Ensure no proxy blocking SSE (some corporate networks do)

## Production Deployment

### Backend (FastAPI)

Use a production ASGI server:

```bash
pip install gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Or deploy to:
- Render (Railway, Heroku) – Push repo, set env vars, done
- Google Cloud Run
- AWS Lambda (with proxy layer)

### Frontend (Static Files)

Deploy to:
- Vercel / Netlify (connect GitHub repo)
- AWS S3 + CloudFront
- GitHub Pages

Update `API_BASE` in `app.js` to production backend URL.

### MongoDB
MongoDB Atlas is already cloud-hosted (no deployment needed).

## Development Notes

- **SSE Queue:** Uses in-memory asyncio.Queue (single-process only). For multi-process, use Redis Pub/Sub.
- **Groq Fallback:** If Groq API fails, heuristic judge in `judge.py` provides scores.
- **PDF Generation:** Uses ReportLab; stores in-memory buffer (no disk I/O).
- **Chart.js:** Rendered client-side after results loaded.

## License

Unlicensed / No rules – Use freely.

## Support

For issues:
1. Check logs: `uvicorn main:app --log-level debug`
2. Inspect browser console for frontend errors
3. Verify .env and MongoDB connection
