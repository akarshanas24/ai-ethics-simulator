// ==================== COMPONENT RENDERING ====================

/**
 * Render the Home Page
 */
function renderHomePage(onStartClick) {
    return `
        <div class="page active" data-page="home">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="container-md">
                    <h1>AI Ethics Simulator</h1>
                    <p>Simulate multi-agent debates on AI ethics in real-time. Explore complex ethical dilemmas through diverse AI perspectives.</p>
                    <button class="btn btn-primary btn-large" id="hero-start-btn">
                        Start Simulation →
                    </button>
                </div>
            </div>

            <!-- Why AI Ethics Section -->
            <div class="features-section">
                <div class="container">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-sm);">Why AI Ethics Simulation Matters</h2>
                    <p style="text-align: center; color: var(--text-secondary); max-width: 700px; margin: 0 auto var(--spacing-lg);">
                        Understanding ethical implications of AI decisions requires exploring multiple perspectives. Our simulator creates a safe space to examine complex moral questions before they impact the real world.
                    </p>
                    <div class="features-grid">
                        ${FEATURES.map(feature => `
                            <div class="feature-card">
                                <div class="feature-icon">${feature.icon}</div>
                                <h6>${feature.title}</h6>
                                <p style="margin: 0; font-size: 0.95rem; color: var(--text-secondary);">${feature.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- How It Works Section -->
            <div class="how-it-works" style="display: flex; flex-direction: column; align-items: center;">
                <div class="container-md" style="display: flex; flex-direction: column; align-items: center;">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-sm);">How It Works</h2>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-lg);">
                        Get started with AI ethics simulation in four simple steps
                    </p>

                    <div class="stepper-container">
                        <!-- Stepper Dots -->
                        <div class="stepper-dots" id="stepper-dots">
                            ${ONBOARDING_STEPS.map((_, idx) => `
                                <div class="stepper-dot ${idx === 0 ? 'active' : ''}" data-step="${idx}"></div>
                            `).join('')}
                        </div>

                        <!-- Step Number -->
                        <div class="step-number" id="step-number">1</div>

                        <!-- Step Content -->
                        <div id="step-content">
                            <div class="step-title">${ONBOARDING_STEPS[0].title}</div>
                            <p class="step-description">${ONBOARDING_STEPS[0].description}</p>
                        </div>

                        <!-- Navigation Buttons -->
                        <div class="stepper-buttons">
                            <button class="btn btn-outlined btn-medium" id="step-prev-btn" disabled>Previous</button>
                            <button class="btn btn-outlined btn-medium" id="step-next-btn">Next</button>
                        </div>
                    </div>

                    <div class="text-center" style="margin-top: var(--spacing-lg); width: 100%; display: flex; justify-content: center;">
                        <button class="btn btn-primary btn-large" id="home-begin-btn">
                            Begin Your First Simulation →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render the Scenario Selection Page
 */
function renderScenarioPage(scenarios, onScenarioSelect) {
    const categoriesWithAll = ["All Categories", ...CATEGORIES];

    return `
        <div class="page" data-page="scenario">
            <div class="scenario-page">
                <button class="btn btn-text back-button" id="scenario-back-btn">← Back to Welcome</button>

                <div class="page-header">
                    <h3 style="color: var(--primary); margin-bottom: var(--spacing-sm);">Choose Your Ethical Scenario</h3>
                    <p style="font-size: 1.05rem; color: var(--text-secondary);">
                        Select a pre-built ethical dilemma or create your own custom scenario for AI agents to debate.
                    </p>
                </div>

                <div class="search-bar">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="search" 
                        class="search-input" 
                        id="scenario-search" 
                        placeholder="Search scenarios..."
                        aria-label="Search scenarios"
                    >
                </div>

                <div class="category-filter" id="category-filter">
                    ${categoriesWithAll.map(cat => `
                        <button 
                            class="chip clickable ${cat === 'All Categories' ? 'primary' : ''}" 
                            data-value="${cat}"
                        >
                            ${cat}
                        </button>
                    `).join('')}
                </div>

                <button class="btn btn-outlined mb-lg" id="custom-scenario-toggle">+ Create Custom Scenario</button>

                <div class="scenarios-grid" id="scenarios-grid">
                    ${renderScenarioCards(scenarios)}
                </div>

                <!-- Custom Scenario Form (hidden by default) -->
                <div id="custom-form-container" style="display: none;"></div>
            </div>
        </div>
    `;
}

/**
 * Render scenario cards
 */
function renderScenarioCards(scenarios) {
    return scenarios.map(scenario => `
        <div class="scenario-card" data-scenario-id="${scenario.id}">
            <div>
                <div class="scenario-meta">
                    <span class="chip info">${scenario.category}</span>
                    <span class="chip ${getDifficultyClass(scenario.difficulty)}">${scenario.difficulty}</span>
                </div>
                <h6 class="scenario-title">${scenario.title}</h6>
                <p class="scenario-description">${scenario.description}</p>
                <div class="participants-label">Participants:</div>
                <div class="participants-chips">
                    ${scenario.participants.map(p => `<span class="chip">${p}</span>`).join('')}
                </div>
            </div>
            <button class="btn btn-primary scenario-action" data-scenario-id="${scenario.id}">
                Select Scenario →
            </button>
        </div>
    `).join('');
}

/**
 * Render the Agent Configuration Page
 */
function renderAgentConfigPage(selectedScenario, selectedAgentIndices) {
    const selectedAgents = selectedAgentIndices.map(idx => AGENT_BANK[idx]);

    return `
        <div class="page" data-page="agentConfig">
            <div class="agent-config-page">
                <button class="btn btn-text back-button" id="agentconfig-back-btn">← Back to Scenarios</button>

                <div class="agent-header">
                    <h3 style="color: var(--primary); margin-bottom: var(--spacing-sm);">Configure AI Agents</h3>
                    <p style="font-size: 1.05rem; color: var(--text-secondary);">
                        Select and customize the AI agents that will participate in your ethical debate.
                    </p>
                </div>

                <div class="scenario-info">
                    <div class="scenario-info-title">
                        Selected Scenario: ${selectedScenario.title}
                    </div>
                    <div class="scenario-info-desc">
                        ${selectedScenario.description}
                    </div>
                </div>

                <div class="agents-header">
                    <h5>👥 Available Agents</h5>
                    <span class="chip primary" style="font-weight: 600;">${selectedAgentIndices.length} selected</span>
                </div>
                <p style="margin: var(--spacing-sm) 0 var(--spacing-lg); font-size: 0.95rem; color: var(--text-secondary);">
                    Minimum 2 agents required • ${selectedAgentIndices.length >= 2 ? '✓ Ready to proceed' : 'Select at least 2 agents'}
                </p>

                <div class="agents-grid" id="agents-grid">
                    ${AGENT_BANK.map((agent, idx) => `
                        <div class="agent-card ${selectedAgentIndices.includes(idx) ? 'selected' : ''}" data-agent-idx="${idx}">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
                                    <div style="display: flex; gap: var(--spacing-sm); align-items: flex-start; flex: 1; min-width: 0;">
                                        <div class="agent-avatar">${agent.avatar}</div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div class="agent-name">${agent.name}</div>
                                            <span class="chip info" style="margin-top: 6px; font-weight: 600; font-size: 0.8rem;">${agent.role}</span>
                                        </div>
                                    </div>
                                    <label class="switch agent-switch" style="flex-shrink: 0;">
                                        <input 
                                            type="checkbox" 
                                            class="agent-toggle" 
                                            data-agent-idx="${idx}" 
                                            ${selectedAgentIndices.includes(idx) ? 'checked' : ''}
                                        >
                                    </label>
                                </div>
                                <p class="agent-ethical">${agent.ethical}</p>
                                <div class="agent-framework-label">Ethical Framework:</div>
                                <p class="agent-framework">${agent.framework}</p>
                                <div class="agent-personality-label">Personality:</div>
                                <p class="agent-personality">${agent.personality}</p>
                            </div>
                            <button class="btn btn-outlined agent-customize" style="width: 100%;">✎ Customize</button>
                        </div>
                    `).join('')}
                </div>

                <div class="config-summary">
                    <div class="summary-title">⚙️ Debate Configuration Summary</div>
                    <p style="margin-bottom: var(--spacing-md); font-weight: 500;">Active Participants (${selectedAgentIndices.length}):</p>
                    <div class="selected-agents">
                        ${selectedAgents.map(agent => `
                            <span class="chip" style="font-weight: 500;">
                                <span style="font-size: 1.2rem; margin-right: 6px;">${agent.avatar}</span>
                                ${agent.name} - ${agent.role}
                            </span>
                        `).join('')}
                    </div>
                    <p class="summary-text">
                        ${selectedAgentIndices.length >= 2 
                            ? "Ready to start the ethical debate simulation" 
                            : "Select at least 2 agents to enable debate"}
                    </p>
                    <button class="btn btn-primary btn-large start-debate-btn" id="start-debate-btn" 
                            ${selectedAgentIndices.length < 2 ? 'disabled' : ''}>
                        Start Debate →
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render custom scenario form
 */
function renderCustomScenarioForm(onSave, onCancel) {
    return `
        <div class="custom-scenario-form">
            <h5 style="margin-bottom: var(--spacing-lg);">Create Custom Scenario</h5>
            
            <div class="form-group">
                <label>Title *</label>
                <input type="text" id="custom-title" placeholder="Enter scenario title" class="form-input">
            </div>

            <div class="form-group">
                <label>Description *</label>
                <textarea id="custom-description" placeholder="Describe the ethical dilemma"></textarea>
            </div>

            <div class="form-group">
                <label>Category *</label>
                <select id="custom-category">
                    <option value="">Select Category</option>
                    ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Difficulty *</label>
                <select id="custom-difficulty">
                    <option value="">Select Difficulty</option>
                    ${DIFFICULTIES.map(diff => `<option value="${diff}">${diff}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Participants (comma separated) *</label>
                <input type="text" id="custom-participants" placeholder="e.g., Government Official, Citizen">
            </div>

            <div class="form-buttons">
                <button class="btn btn-primary" id="save-custom-scenario">Save Scenario</button>
                <button class="btn btn-text" id="cancel-custom-scenario">Cancel</button>
            </div>
        </div>
    `;
}

/**
 * Helper: Get CSS class for difficulty
 */
function getDifficultyClass(difficulty) {
    const classMap = {
        "Beginner": "success",
        "Intermediate": "warning",
        "Advanced": "error"
    };
    return classMap[difficulty] || "info";
}

/**
 * Update scenario cards (for filtering)
 */
function updateScenarioCards(scenarios) {
    const container = document.getElementById('scenarios-grid');
    if (container) {
        container.innerHTML = renderScenarioCards(scenarios);
    }
}

/**
 * Update stepper
 */
function updateStepper(currentStep) {
    // Update dots
    document.querySelectorAll('.stepper-dot').forEach((dot, idx) => {
        if (idx === currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Update step number and content
    const step = ONBOARDING_STEPS[currentStep];
    document.getElementById('step-number').textContent = step.step;
    document.getElementById('step-content').innerHTML = `
        <div class="step-title">${step.title}</div>
        <p class="step-description">${step.description}</p>
    `;

    // Update button states
    document.getElementById('step-prev-btn').disabled = currentStep === 0;
    document.getElementById('step-next-btn').disabled = currentStep === ONBOARDING_STEPS.length - 1;
}

/**
 * Update agent configuration UI
 */
function updateAgentUI(selectedIndices) {
    // Update cards
    document.querySelectorAll('.agent-card').forEach(card => {
        const idx = parseInt(card.getAttribute('data-agent-idx'));
        if (selectedIndices.includes(idx)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    // Update toggles
    document.querySelectorAll('.agent-toggle').forEach(toggle => {
        const idx = parseInt(toggle.getAttribute('data-agent-idx'));
        toggle.checked = selectedIndices.includes(idx);
    });

    // Update summary
    const selectedAgents = selectedIndices.map(idx => AGENT_BANK[idx]);
    const selectedChips = selectedAgents.map(agent => `
        <span class="chip" style="font-weight: 500;">
            <span style="font-size: 1.2rem; margin-right: 6px;">${agent.avatar}</span>
            ${agent.name} - ${agent.role}
        </span>
    `).join('');

    document.querySelector('.selected-agents').innerHTML = selectedChips;

    // Update status text
    const statusText = selectedIndices.length >= 2 
        ? "Ready to start the ethical debate simulation" 
        : "Select at least 2 agents to enable debate";
    document.querySelector('.summary-text').textContent = statusText;

    // Update button state
    const startBtn = document.getElementById('start-debate-btn');
    if (startBtn) {
        if (selectedIndices.length >= 2) {
            startBtn.disabled = false;
        } else {
            startBtn.disabled = true;
        }
    }

    // Update selected count
    const countChip = document.querySelector('.chip.primary');
    if (countChip) {
        countChip.textContent = `${selectedIndices.length} selected`;
    }
}

/**
 * Render the Debate/Simulation Page
 */
function renderDebatePage(scenario, selectedAgentIndices) {
    const agents = selectedAgentIndices.map(idx => AGENT_BANK[idx]);

    return `
        <div class="page" data-page="debate">
            <div class="debate-page">
                <!-- Header -->
                <div class="debate-header">
                    <button class="btn btn-text back-button" id="debate-back-btn">← Back to Configuration</button>
                    <div class="debate-title-section">
                        <h2 style="margin-bottom: var(--spacing-sm);">${scenario.title}</h2>
                        <p style="font-size: 0.95rem; color: var(--text-secondary);">${scenario.description}</p>
                    </div>
                </div>

                <!-- Debate Controls -->
                <div class="debate-controls">
                    <div class="round-indicator">
                        <span id="current-round" style="font-weight: 600;">Round 1: Opening Arguments</span>
                        <div class="progress-bar" id="debate-progress">
                            <div class="progress-fill" style="width: 33.33%;"></div>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="start-debate-simulation">▶ Start Debate</button>
                </div>

                <!-- Main Debate Container -->
                <div class="debate-container">
                    <!-- Agents Panel -->
                    <div class="agents-panel">
                        <h5 style="margin-bottom: var(--spacing-md); font-weight: 600;">Participating Agents</h5>
                        <div class="agents-list">
                            ${agents.map((agent, idx) => `
                                <div class="agent-badge" data-agent-id="${AGENT_BANK.indexOf(agent)}">
                                    <span style="font-size: 1.5rem;">${agent.avatar}</span>
                                    <div class="badge-content">
                                        <div class="badge-name">${agent.name}</div>
                                        <div class="badge-role">${agent.role}</div>
                                        <div class="badge-score" id="score-agent-${idx}">Score: 0</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Chat/Debate Area -->
                    <div class="debate-chat">
                        <div class="chat-messages" id="chat-messages">
                            <div class="chat-placeholder">
                                <p style="font-size: 1.1rem; margin-bottom: var(--spacing-md);">💬 Debate Arena</p>
                                <p style="color: var(--text-secondary);">Click "Start Debate" to begin the simulation. Watch as AI agents present their arguments, counterpoints, and rebuttals across three rounds.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Round Info -->
                    <div class="round-info">
                        <h5 style="margin-bottom: var(--spacing-md); font-weight: 600;">Round Overview</h5>
                        <div class="round-stages">
                            <div class="stage-card">
                                <div class="stage-number">1</div>
                                <div>
                                    <div class="stage-title">Opening Arguments</div>
                                    <div class="stage-desc">Sequential opening positions</div>
                                </div>
                            </div>
                            <div class="stage-card">
                                <div class="stage-number">2</div>
                                <div>
                                    <div class="stage-title">Rebuttals</div>
                                    <div class="stage-desc">Targeted counterarguments</div>
                                </div>
                            </div>
                            <div class="stage-card">
                                <div class="stage-number">3</div>
                                <div>
                                    <div class="stage-title">Closing Position</div>
                                    <div class="stage-desc">Final policy proposals</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Debate Results Page
 */
function renderResultsPage(scenario, selectedAgentIndices, results) {
    const agents = selectedAgentIndices.map(idx => AGENT_BANK[idx]);
    const winner = results.winner;
    const scores = results.scores;

    return `
        <div class="page" data-page="results">
            <div class="results-page">
                <!-- Header -->
                <div class="results-header">
                    <button class="btn btn-text back-button" id="results-back-btn">← Start New Debate</button>
                    <h2 style="text-align: center; margin-bottom: var(--spacing-lg);">Debate Results & Analysis</h2>
                </div>

                <div class="results-container">
                    <!-- Winner Hero Card -->
                    <div class="winner-card">
                        <div class="winner-icon">${winner.avatar}</div>
                        <h3 style="margin-bottom: var(--spacing-sm);">${winner.name} Won!</h3>
                        <div class="winner-role">${winner.role}</div>
                        <div class="winner-score">Final Score: <strong>${results.winnerScore}/10</strong></div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: var(--spacing-md);">
                            Best argued position based on Clarity, Evidence, Ethics, and Persuasion metrics.
                        </p>
                    </div>

                    <!-- Scoring Breakdown -->
                    <div class="card scored-breakdown">
                        <div class="card-header">📊 Agent Scores</div>
                        <div class="scores-grid" id="scores-grid">
                            ${agents.map((agent, idx) => {
                                const score = scores[AGENT_BANK.indexOf(agent)];
                                return `
                                    <div class="score-item">
                                        <div class="score-agent">
                                            <span style="font-size: 1.2rem;">${agent.avatar}</span>
                                            <div>
                                                <div style="font-weight: 600; font-size: 0.95rem;">${agent.name}</div>
                                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${agent.role}</div>
                                            </div>
                                        </div>
                                        <div class="score-value">${score}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Policy Recommendation -->
                    <div class="card policy-card">
                        <div class="card-header">📋 Recommended Policy</div>
                        <p style="line-height: 1.8; color: var(--text-secondary);">
                            ${results.policyRecommendation || 'Based on the debate analysis, the consensus recommendation integrates ethical frameworks from all perspectives to balance innovation with safety considerations.'}
                        </p>
                    </div>

                    <!-- Transcript Link -->
                    <div style="display: flex; justify-content: center; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
                        <button class="btn btn-primary" id="view-transcript-btn">📝 View Full Transcript</button>
                        <button class="btn btn-outlined" id="export-pdf-btn">💾 Export as PDF</button>
                        <button class="btn btn-outlined" id="share-results-btn">🔗 Share Debate</button>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; justify-content: center; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
                        <button class="btn btn-primary btn-large" id="restart-debate-btn">Start New Debate</button>
                        <button class="btn btn-text btn-large" id="home-btn">Return Home</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
