from collections import defaultdict
from typing import List, Dict
import json

def judge_debate_heuristic(messages: List[Dict], agents: List[Dict]) -> Dict:
    """Fallback heuristic judge when Groq fails."""
    scores = defaultdict(lambda: {"clarity": 0.0, "evidence": 0.0, "ethics": 0.0, "persuasion": 0.0, "count": 0})

    for m in messages:
        agent = m['agent']
        text = m['text']
        length = len(text)
        
        clarity = min(10.0, max(1.0, length / 20.0))
        evidence = 7.0 if any(w in text.lower() for w in ['data', 'evidence', 'research', 'study']) else 4.0
        ethics = 8.0 if any(w in text.lower() for w in ['ethic', 'moral', 'right', 'duty', 'principle']) else 5.0
        persuasion = min(10.0, 1.0 + length / 30.0)

        scores[agent]['clarity'] += clarity
        scores[agent]['evidence'] += evidence
        scores[agent]['ethics'] += ethics
        scores[agent]['persuasion'] += persuasion
        scores[agent]['count'] += 1

    result = {}
    for agent, vals in scores.items():
        cnt = max(1, vals['count'])
        clarity = vals['clarity'] / cnt
        evidence = vals['evidence'] / cnt
        ethics = vals['ethics'] / cnt
        persuasion = vals['persuasion'] / cnt
        total = (clarity + evidence + ethics + persuasion) / 4.0
        result[agent] = {
            'clarity': round(clarity, 2),
            'evidence': round(evidence, 2),
            'ethics': round(ethics, 2),
            'persuasion': round(persuasion, 2),
            'total': round(total, 2)
        }

    sorted_agents = sorted(result.items(), key=lambda kv: (kv[1]['total'], kv[1]['ethics']), reverse=True)
    winner, winner_scores = sorted_agents[0] if sorted_agents else (agents[0]['name'], {})

    return {
        "winner": winner,
        "scores": result,
        "rationale": f"{winner} won based on total score (ethics tiebreaker applied)."
    }

def synthesize_policy(scenario: str, debate_summary: str, judge_result: Dict) -> Dict:
    """Synthesize a policy recommendation based on debate."""
    winner = judge_result.get('winner', 'Unknown')
    return {
        "title": f"Policy: {scenario}",
        "author": winner,
        "summary": f"Based on ethical debate, {winner} proposed this policy direction.",
        "body": "[This policy synthesizes the ethical perspectives from the debate. In production, use Judge AI to generate full text.]"
    }
