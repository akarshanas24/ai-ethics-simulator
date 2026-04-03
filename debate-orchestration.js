/**
 * Start debate orchestration with real backend SSE streaming
 */
async function startDebateOrchestration(selectedScenario, selectedAgentIndices) {
    AppState.selectedScenario = selectedScenario;
    AppState.selectedAgentIndices = selectedAgentIndices;

    const agents = selectedAgentIndices.map(idx => AGENT_BANK[idx]);

    // Create debate via API
    try {
        const debateRes = await ApiClient.createDebate(selectedScenario, selectedAgentIndices, agents);
        const debateId = debateRes.debate_id;
        AppState.currentDebateId = debateId;

        // Render debate page
        const debatePage = document.querySelector('[data-page="debate"]');
        debatePage.innerHTML = renderDebatePage(selectedScenario, agents, debateId);
        AppState.setPage('debate');

        // Setup events
        setupDebatePageEvents();

        // Start debate and stream
        await ApiClient.startDebate(debateId);
        connectDebateStream(debateId);

    } catch (error) {
        console.error('Failed to start debate:', error);
        alert('Error starting debate. Please try again. Make sure backend is running at http://localhost:8000');
    }
}

function connectDebateStream(debateId) {
    let currentRound = 0;
    let messageBuffer = {};

    AppState.currentEventSource = ApiClient.streamDebate(debateId, (payload) => {
        if (payload.type === 'status') {
            // Round status
            const chatMessages = document.querySelector('.chat-messages');
            if (!chatMessages) return;
            
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = 'text-align: center; margin: var(--spacing-lg) 0; font-weight: 600; color: var(--primary); font-size: 1.1rem;';
            statusDiv.textContent = payload.message || `Round ${payload.round}`;
            chatMessages.appendChild(statusDiv);

        } else if (payload.type === 'chunk') {
            // Streaming text chunk
            const chatMessages = document.querySelector('.chat-messages');
            if (!chatMessages) return;
            
            const agent = payload.agent;
            const text = payload.text;

            if (!messageBuffer[agent]) {
                messageBuffer[agent] = { full: '', bubble: null };
            }

            messageBuffer[agent].full += text;

            // Create or update bubble
            if (!messageBuffer[agent].bubble) {
                messageBuffer[agent].bubble = document.createElement('div');
                messageBuffer[agent].bubble.className = 'chat-bubble';
                messageBuffer[agent].bubble.innerHTML = `
                    <div style="font-size: 1.5rem; line-height: 1;">👤</div>
                    <div class="bubble-content">
                        <div class="bubble-agent">${agent}</div>
                        <div class="bubble-text"></div>
                    </div>
                `;
                chatMessages.appendChild(messageBuffer[agent].bubble);
            }

            // Update text content
            const textDiv = messageBuffer[agent].bubble.querySelector('.bubble-text');
            textDiv.textContent = messageBuffer[agent].full;

            // Auto-scroll
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } else if (payload.type === 'message_done') {
            // Message complete, reset buffer for next agent
            if (messageBuffer[payload.agent]) {
                delete messageBuffer[payload.agent];
            }

        } else if (payload.type === 'finished') {
            // Debate finished, display results
            console.log('🎉 Debate finished! Calling displayDebateResults...');
            if (AppState.currentEventSource) {
                AppState.currentEventSource.close();
            }
            try {
                displayDebateResults(payload.results);
            } catch (err) {
                console.error('❌ Error displaying results:', err);
                alert('Error displaying results. Check console.');
            }
        }
    });
}

function displayDebateResults(results) {
    console.log('🏆 displayDebateResults called with:', results);
    const judge = results.judge_result || {};
    const policy = results.policy || {};
    const scores = judge.scores || {};

    // Go to results page
    const resultsPage = document.querySelector('[data-page="results"]');
    console.log('📄 Results page element:', resultsPage);
    
    if (!resultsPage) {
        console.error('❌ Results page element not found!');
        return;
    }

    const resultsHTML = renderResultsPage({
        winner: judge.winner,
        winnerScore: (scores[judge.winner]?.total || 0).toFixed(2),
        scores: scores,
        policyRecommendation: policy.body || 'Policy recommendation',
        transcript: results.transcript || []
    });
    
    console.log('📝 Rendered results HTML length:', resultsHTML.length);
    resultsPage.innerHTML = resultsHTML;
    console.log('✅ Results HTML inserted into page');

    console.log('🔄 Switching to results page');
    AppState.setPage('results');
    console.log('📋 Setting up results page events');
    setupResultsPageEvents();
    console.log('✅ Results page events set up');

    // Render charts after page is rendered
    const agentNames = Object.keys(scores);
    const totalScores = agentNames.map(name => scores[name].total || 0);
    const clarityScores = agentNames.map(name => scores[name].clarity || 0);
    const evidenceScores = agentNames.map(name => scores[name].evidence || 0);
    const ethicsScores = agentNames.map(name => scores[name].ethics || 0);
    const persuasionScores = agentNames.map(name => scores[name].persuasion || 0);
    
    console.log('📊 Chart data prepared, rendering in 100ms...');
    setTimeout(() => {
        console.log('📈 Rendering charts...');
        renderResultsCharts({
            agentNames,
            totalScores,
            clarityScores,
            evidenceScores,
            ethicsScores,
            persuasionScores,
            winner: judge.winner,
            scores
        });
        console.log('✅ Charts rendered');
    }, 100);
}
