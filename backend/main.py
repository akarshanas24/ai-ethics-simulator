import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.debates import router as debates_router
from database import get_client, close_client

app = FastAPI(title='AI Ethics Simulator - Backend')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debates_router, prefix='/debates')

@app.on_event('startup')
async def startup():
    # ensure DB client created
    get_client()
    # place to initialize other clients (Groq, etc.)
    app.state.queues = {}

@app.on_event('shutdown')
async def shutdown():
    await close_client()
