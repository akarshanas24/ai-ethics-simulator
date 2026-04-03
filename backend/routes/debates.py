import asyncio
import json
import uuid
from fastapi import APIRouter, BackgroundTasks, Request, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from typing import Dict, Any
from datetime import datetime

from database import get_db
from groq_client import (
    generate_round1_opening,
    generate_round2_rebuttal,
    generate_round3_closing,
    judge_debate
)
from judge import judge_debate_heuristic, synthesize_policy

router = APIRouter()

@router.post('/', status_code=201)
async def create_debate(payload: Dict[str, Any], request: Request):
    """Create a new debate record."""
    db = get_db()
    debate_id = str(uuid.uuid4())
    doc = {
        '_id': debate_id,
        'scenario': payload.get('scenario'),
        'agents': payload.get('agents'),
        'agent_indices': payload.get('agent_indices', []),
        'messages': [],
        'status': 'created',
        'created_at': datetime.utcnow()
    }
    await db.debates.insert_one(doc)

    # create an asyncio.Queue for SSE streaming
    if not hasattr(request.app.state, 'queues'):
        request.app.state.queues = {}
    request.app.state.queues[debate_id] = asyncio.Queue()

    return {'debate_id': debate_id}

@router.post('/{debate_id}/start')
async def start_debate(debate_id: str, background_tasks: BackgroundTasks, request: Request):
    """Start a debate orchestration in background."""
    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Debate not found')

    background_tasks.add_task(_orchestrate_debate, debate_id, request.app)
    return JSONResponse({'status': 'starting'})

async def _orchestrate_debate(debate_id: str, app):
    """Main orchestration: 3 rounds + judging."""
    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        return

    agents = doc.get('agents', [])
    scenario = doc.get('scenario', {})
    queue = app.state.queues.get(debate_id)

    all_messages = []
    agent_arguments = {}  # track last arg per agent for rebuttal round

    try:
        # === ROUND 1: Opening Arguments ===
        await db.debates.update_one({'_id': debate_id}, {'$set': {'status': 'round_1'}})
        if queue:
            await queue.put({'type': 'status', 'round': 1, 'message': 'Round 1: Opening Arguments'})

        for agent in agents:
            full_text = ""
            async for chunk in generate_round1_opening(scenario.get('description', 'Unknown scenario'), agent):
                full_text += chunk
                msg_payload = {'type': 'chunk', 'agent': agent['name'], 'text': chunk, 'round': 1}
                if queue:
                    await queue.put(msg_payload)

            msg_doc = {
                'debate_id': debate_id,
                'agent': agent['name'],
                'text': full_text,
                'round': 1,
                'timestamp': datetime.utcnow()
            }
            await db.messages.insert_one(msg_doc)
            all_messages.append(msg_doc)
            agent_arguments[agent['name']] = full_text

            if queue:
                await queue.put({'type': 'message_done', 'agent': agent['name'], 'round': 1})

        # === ROUND 2: Targeted Rebuttals ===
        await db.debates.update_one({'_id': debate_id}, {'$set': {'status': 'round_2'}})
        if queue:
            await queue.put({'type': 'status', 'round': 2, 'message': 'Round 2: Rebuttals'})

        sorted_agents = sorted(agents, key=lambda a: len(agent_arguments.get(a['name'], '')), reverse=True)
        for agent in agents:
            opponent = next((a for a in sorted_agents if a['name'] != agent['name']), agents[0])
            opponent_arg = agent_arguments.get(opponent['name'], '')

            full_text = ""
            async for chunk in generate_round2_rebuttal(scenario.get('description', ''), agent, opponent, opponent_arg):
                full_text += chunk
                msg_payload = {'type': 'chunk', 'agent': agent['name'], 'text': chunk, 'round': 2}
                if queue:
                    await queue.put(msg_payload)

            msg_doc = {
                'debate_id': debate_id,
                'agent': agent['name'],
                'text': full_text,
                'round': 2,
                'timestamp': datetime.utcnow()
            }
            await db.messages.insert_one(msg_doc)
            all_messages.append(msg_doc)

            if queue:
                await queue.put({'type': 'message_done', 'agent': agent['name'], 'round': 2})

        # === ROUND 3: Closing Proposals ===
        await db.debates.update_one({'_id': debate_id}, {'$set': {'status': 'round_3'}})
        if queue:
            await queue.put({'type': 'status', 'round': 3, 'message': 'Round 3: Policy Proposals'})

        for agent in agents:
            full_text = ""
            async for chunk in generate_round3_closing(scenario.get('description', ''), agent):
                full_text += chunk
                msg_payload = {'type': 'chunk', 'agent': agent['name'], 'text': chunk, 'round': 3}
                if queue:
                    await queue.put(msg_payload)

            msg_doc = {
                'debate_id': debate_id,
                'agent': agent['name'],
                'text': full_text,
                'round': 3,
                'timestamp': datetime.utcnow()
            }
            await db.messages.insert_one(msg_doc)
            all_messages.append(msg_doc)

            if queue:
                await queue.put({'type': 'message_done', 'agent': agent['name'], 'round': 3})

        # === JUDGING ===
        await db.debates.update_one({'_id': debate_id}, {'$set': {'status': 'judging'}})
        if queue:
            await queue.put({'type': 'status', 'message': 'Judging in progress...'})

        # try real Judge AI via Groq, fall back to heuristic
        transcript_summary = "\n".join([f"{m['agent']}: {m['text'][:60]}..." for m in all_messages])
        try:
            judge_result = await judge_debate(scenario.get('description', ''), transcript_summary, agents)
        except:
            judge_result = judge_debate_heuristic(all_messages, agents)

        # synthesize policy
        policy = synthesize_policy(scenario.get('title', 'Scenario'), transcript_summary, judge_result)

        # store results
        results = {
            'judge_result': judge_result,
            'policy': policy,
            'transcript': [
                {
                    'agent': m['agent'],
                    'text': m['text'],
                    'round': m['round'],
                    'timestamp': m['timestamp'].isoformat() if hasattr(m['timestamp'], 'isoformat') else str(m['timestamp'])
                }
                for m in all_messages
            ]
        }

        await db.debates.update_one(
            {'_id': debate_id},
            {'$set': {'status': 'finished', 'results': results, 'finished_at': datetime.utcnow()}}
        )

        if queue:
            await queue.put({'type': 'finished', 'results': results})

    except Exception as e:
        print(f"Error in debate orchestration: {e}")
        await db.debates.update_one({'_id': debate_id}, {'$set': {'status': 'error', 'error': str(e)}})
        if queue:
            await queue.put({'type': 'error', 'message': str(e)})

@router.get('/{debate_id}/stream')
async def stream_debate(debate_id: str, request: Request):
    """SSE endpoint for live debate messages."""
    if not hasattr(request.app.state, 'queues') or debate_id not in request.app.state.queues:
        raise HTTPException(status_code=404, detail='Stream not found')

    queue = request.app.state.queues[debate_id]

    async def event_generator():
        try:
            while True:
                payload = await queue.get()
                yield f"data: {json.dumps(payload)}\n\n"
        except asyncio.CancelledError:
            return

    return StreamingResponse(event_generator(), media_type='text/event-stream')

@router.get('/{debate_id}/results')
async def get_results(debate_id: str):
    """Fetch final debate results."""
    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Debate not found')
    return {
        'debate_id': debate_id,
        'status': doc.get('status'),
        'results': doc.get('results'),
        'created_at': doc.get('created_at'),
        'finished_at': doc.get('finished_at')
    }

@router.get('/{debate_id}/summary')
async def get_summary(debate_id: str):
    """Get a summary for sharing."""
    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Debate not found')
    
    results = doc.get('results', {})
    judge = results.get('judge_result', {})
    return {
        'debate_id': debate_id,
        'scenario': doc.get('scenario', {}),
        'winner': judge.get('winner', 'Unknown'),
        'scores': judge.get('scores', {}),
        'share_url': f"/debates/{debate_id}/share"
    }

@router.post('/{debate_id}/export-pdf')
async def export_pdf(debate_id: str):
    """Export debate as PDF."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from io import BytesIO

    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Debate not found')

    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=18, textColor='#1976d2')
    scenario = doc.get('scenario', {})
    story.append(Paragraph(f"AI Ethics Debate: {scenario.get('title', 'Untitled')}", title_style))
    story.append(Spacer(1, 12))

    # Scenario
    story.append(Paragraph("<b>Scenario:</b>", styles['Heading2']))
    story.append(Paragraph(scenario.get('description', 'N/A'), styles['Normal']))
    story.append(Spacer(1, 12))

    # Transcript
    story.append(Paragraph("<b>Debate Transcript:</b>", styles['Heading2']))
    results = doc.get('results', {})
    for msg in results.get('transcript', [])[:20]:  # limit to first 20
        story.append(Paragraph(f"<b>{msg['agent']} (Round {msg['round']}):</b> {msg['text'][:200]}...", styles['Normal']))
        story.append(Spacer(1, 6))

    # Results
    judge = results.get('judge_result', {})
    story.append(PageBreak())
    story.append(Paragraph("<b>Judge Results:</b>", styles['Heading2']))
    story.append(Paragraph(f"Winner: <b>{judge.get('winner', 'N/A')}</b>", styles['Normal']))
    for agent, scores in judge.get('scores', {}).items():
        story.append(Paragraph(f"{agent}: Clarity {scores.get('clarity')}/10, Evidence {scores.get('evidence')}/10, Ethics {scores.get('ethics')}/10, Persuasion {scores.get('persuasion')}/10", styles['Normal']))
    story.append(Spacer(1, 12))

    # Policy
    policy = results.get('policy', {})
    story.append(Paragraph(f"<b>Policy:</b> {policy.get('title', 'N/A')}", styles['Heading2']))
    story.append(Paragraph(policy.get('body', 'N/A'), styles['Normal']))

    pdf.build(story)
    buffer.seek(0)
    return FileResponse(
        buffer,
        filename=f"debate_{debate_id}.pdf",
        media_type="application/pdf"
    )

@router.get('/{debate_id}/stream')
async def stream_debate(debate_id: str, request: Request):
    # SSE endpoint
    if not hasattr(request.app.state, 'queues') or debate_id not in request.app.state.queues:
        raise HTTPException(status_code=404, detail='Stream not found')

    queue = request.app.state.queues[debate_id]

    async def event_generator():
        try:
            while True:
                payload = await queue.get()
                yield f"data: {json.dumps(payload)}\n\n"
        except asyncio.CancelledError:
            return

    return StreamingResponse(event_generator(), media_type='text/event-stream')

@router.get('/{debate_id}/results')
async def get_results(debate_id: str):
    db = get_db()
    doc = await db.debates.find_one({'_id': debate_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Debate not found')
    return {'debate_id': debate_id, 'results': doc.get('results')}
