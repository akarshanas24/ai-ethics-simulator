"""
Offline simulator for debate responses and judging.
This module provides async generators that stream templated text chunks so the app runs without Groq or other paid services.
"""
import asyncio
from typing import Dict, AsyncGenerator, List
from judge import judge_debate_heuristic


def _chunk_text(text: str, size: int = 40):
    for i in range(0, len(text), size):
        yield text[i:i+size]


async def generate_round1_opening(scenario: str, agent: Dict) -> AsyncGenerator[str, None]:
    role = agent.get('role', 'Participant')
    name = agent.get('name', 'Agent')
    personality = agent.get('personality', '')
    full = f"{name} ({role}) argues: In response to the scenario, I prioritize {personality or 'balanced considerations'}. "
    full += "Given the facts, the ethically preferable approach is to balance harms and benefits, protect vulnerable groups, and ensure accountability."
    for chunk in _chunk_text(full):
        await asyncio.sleep(0.03)
        yield chunk


async def generate_round2_rebuttal(scenario: str, agent: Dict, opponent: Dict, opponent_arg: str) -> AsyncGenerator[str, None]:
    name = agent.get('name', 'Agent')
    full = f"{name} rebuts: I respectfully disagree with {opponent.get('name','opponent')}. In particular, {opponent_arg[:80]}... "
    full += "We should consider alternative trade-offs and unintended consequences, and prioritize fairness in outcomes."
    for chunk in _chunk_text(full):
        await asyncio.sleep(0.03)
        yield chunk


async def generate_round3_closing(scenario: str, agent: Dict) -> AsyncGenerator[str, None]:
    name = agent.get('name', 'Agent')
    full = f"{name} closing: To conclude, my policy recommendation is to adopt practical safeguards, transparent oversight, and measurable targets to mitigate risk."
    for chunk in _chunk_text(full):
        await asyncio.sleep(0.03)
        yield chunk


async def judge_debate(scenario: str, transcript_summary: str, agents: List[Dict]) -> Dict:
    # Use heuristic judge function for offline scoring
    return judge_debate_heuristic([{'agent': a.get('name','Agent'), 'text': transcript_summary, 'round': 0} for a in agents], agents)
