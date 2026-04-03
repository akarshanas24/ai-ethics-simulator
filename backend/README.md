# AI Ethics Simulator Backend (Scaffold)

This folder contains a minimal FastAPI scaffold to run debate orchestration, stream live messages via Server-Sent Events (SSE), and persist debates to MongoDB Atlas.

This scaffold includes placeholder implementations for the Groq Llama streaming client — replace with the real client/integration.

Requirements
- Python 3.10+
- MongoDB Atlas URI (set as `MONGO_URI` environment variable)

Quick start

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

2. Configure environment (Windows PowerShell example):

```powershell
$env:MONGO_URI = "your-mongodb-connection-string"
$env:DB_NAME = "ai_ethics"
```

3. Run the server:

```bash
uvicorn backend.main:app --reload --port 8000
```

API overview
- POST `/debates/` - create a debate record
- POST `/debates/{debate_id}/start` - trigger debate orchestration (background task)
- GET `/debates/{debate_id}/stream` - SSE stream of live messages
- GET `/debates/{debate_id}/results` - fetch stored results

Notes
- The Groq streaming integration is a placeholder (`groq_client.py`). Implement the real streaming client and replace `simulate_*` functions.
- In production, use an external message broker (Redis) or Pub/Sub to handle multi-process streaming.
