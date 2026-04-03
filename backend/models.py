from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Agent(BaseModel):
    name: str
    role: str
    avatar: Optional[str] = None

class Scenario(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str]
    difficulty: Optional[str]
    participants: List[str] = []

class Message(BaseModel):
    agent: str
    text: str
    round: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DebateCreate(BaseModel):
    scenario: Scenario
    agent_indices: List[int]
    agents: List[Agent]

class JudgeScore(BaseModel):
    clarity: float
    evidence: float
    ethics: float
    persuasion: float
    total: float

class DebateDoc(BaseModel):
    _id: Optional[str]
    scenario: Scenario
    agents: List[Agent]
    agent_indices: List[int]
    messages: List[Message] = []
    status: str = "created"
    results: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
