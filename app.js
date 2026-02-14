// ==================== MAIN APP CONTROLLER ====================

/**
 * Application State Manager
 */
const AppState = {
    currentPage: 'home',
    scenarios: [...INITIAL_SCENARIOS],
    selectedScenario: null,
    selectedAgentIndices: [0, 1, 2, 3],
    currentStep: 0,
    searchTerm: '',
    selectedCategory: 'All Categories',
    customScenarioMode: false,

    // Setters
    setPage(page) {
        this.currentPage = page;
        navigateTo(page);
        
        // Re-attach home page listeners when returning to home
        if (page === 'home') {
            setTimeout(() => setupHomePageEvents(), 0);
        }
    },

    setScenario(scenario) {
        this.selectedScenario = scenario;
    },

    setAgentIndices(indices) {
        this.selectedAgentIndices = indices;
    },

    toggleAgent(idx) {
        if (this.selectedAgentIndices.includes(idx)) {
            this.selectedAgentIndices = this.selectedAgentIndices.filter(i => i !== idx);
        } else {
            this.selectedAgentIndices = [...this.selectedAgentIndices, idx];
        }
    },

    setStep(step) {
        const maxStep = ONBOARDING_STEPS.length - 1;
        this.currentStep = Math.min(Math.max(step, 0), maxStep);
    },

    setSearch(term) {
        this.searchTerm = term.toLowerCase();
    },

    setCategory(category) {
        this.selectedCategory = category;
    },

    getFilteredScenarios() {
        return this.scenarios.filter(sc => {
            const matchesCategory = this.selectedCategory === 'All Categories' || sc.category === this.selectedCategory;
            const matchesSearch = 
                sc.title.toLowerCase().includes(this.searchTerm) ||
                sc.description.toLowerCase().includes(this.searchTerm);
            return matchesCategory && matchesSearch;
        });
    },

    addCustomScenario(scenario) {
        const newScenario = {
            id: generateId(),
            ...scenario
        };
        this.scenarios.push(newScenario);
        return newScenario;
    },

    toggleCustomForm() {
        this.customScenarioMode = !this.customScenarioMode;
    }
};

/**
 * Initialize App
 */
function initApp() {
    const root = document.getElementById('root');
    
    // Render only home page and scenario page initially
    // Other pages will be rendered when needed
    root.innerHTML = renderHomePage()
        + renderScenarioPage(AppState.scenarios)
        + `<div class="page" data-page="agentConfig"></div>`
        + `<div class="page" data-page="debate"></div>`
        + `<div class="page" data-page="results"></div>`;

    // Setup Home Page Events
    setupHomePageEvents();
}

/**
 * Setup Home Page Events
 */
function setupHomePageEvents() {
    const homePage = document.querySelector('[data-page="home"]');
    if (!homePage) return;

    const heroBtn = homePage.querySelector('#hero-start-btn');
    const homeBeginBtn = homePage.querySelector('#home-begin-btn');
    const stepPrevBtn = homePage.querySelector('#step-prev-btn');
    const stepNextBtn = homePage.querySelector('#step-next-btn');
    const stepperDots = homePage.querySelectorAll('.stepper-dot');

    heroBtn?.addEventListener('click', () => goToScenarios());
    homeBeginBtn?.addEventListener('click', () => goToScenarios());

    stepPrevBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        AppState.setStep(AppState.currentStep - 1);
        updateStepper(AppState.currentStep);
    });

    stepNextBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        AppState.setStep(AppState.currentStep + 1);
        updateStepper(AppState.currentStep);
    });

    stepperDots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            AppState.setStep(idx);
            updateStepper(AppState.currentStep);
        });
    });
}

/**
 * Go to Scenario Selection Page
 */
function goToScenarios() {
    // Reset search and category before navigating
    AppState.setSearch('');
    AppState.setCategory('All Categories');
    
    // Update scenario page with current state
    const page = document.querySelector('[data-page="scenario"]');
    if (page) {
        const content = renderScenarioPage(AppState.scenarios);
        // Extract inner HTML by removing the outer div
        const innerContent = content.substring(
            content.indexOf('>') + 1,
            content.lastIndexOf('</div>')
        );
        page.innerHTML = innerContent;
    }
    
    AppState.setPage('scenario');

    // Setup scenario page events with fresh listeners
    setTimeout(() => setupScenarioPageEvents(), 0);
}

/**
 * Setup Scenario Page Events
 */
function setupScenarioPageEvents() {
    const backBtn = document.getElementById('scenario-back-btn');
    const searchInput = document.getElementById('scenario-search');
    const categoryFilter = document.getElementById('category-filter');
    const customToggle = document.getElementById('custom-scenario-toggle');
    const categoryChips = categoryFilter?.querySelectorAll('.chip');

    // Back button
    backBtn?.addEventListener('click', () => {
        AppState.setPage('home');
    });

    // Search with debounce
    searchInput?.addEventListener('input', debounce((e) => {
        AppState.setSearch(e.target.value);
        updateScenarioCards(AppState.getFilteredScenarios());
        setupScenarioSelectionListeners();
    }));

    // Category filter
    categoryChips?.forEach(chip => {
        chip.addEventListener('click', () => {
            const category = chip.getAttribute('data-value');
            AppState.setCategory(category);

            // Update UI
            categoryChips.forEach(c => c.classList.remove('primary'));
            chip.classList.add('primary');

            // Update cards
            updateScenarioCards(AppState.getFilteredScenarios());
            setupScenarioSelectionListeners();
        });
    });

    // Custom scenario toggle
    customToggle?.addEventListener('click', () => {
        AppState.toggleCustomForm();
        const container = document.getElementById('custom-form-container');
        
        if (AppState.customScenarioMode) {
            customToggle.style.display = 'none';
            container.innerHTML = renderCustomScenarioForm();
            container.style.display = 'block';
            setupCustomScenarioForm();
        } else {
            customToggle.style.display = 'block';
            container.innerHTML = '';
            container.style.display = 'none';
        }
    });

    // Scenario selection
    setupScenarioSelectionListeners();
}

/**
 * Setup Scenario Selection Listeners
 */
function setupScenarioSelectionListeners() {
    const buttons = document.querySelectorAll('.scenario-action');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scenarioId = btn.getAttribute('data-scenario-id');
            const scenario = AppState.scenarios.find(s => s.id === scenarioId);
            
            if (scenario) {
                AppState.setScenario(scenario);
                goToAgentConfig();
            }
        });
    });
}

/**
 * Setup Custom Scenario Form
 */
function setupCustomScenarioForm() {
    const titleInput = document.getElementById('custom-title');
    const descInput = document.getElementById('custom-description');
    const categorySelect = document.getElementById('custom-category');
    const diffSelect = document.getElementById('custom-difficulty');
    const participantsInput = document.getElementById('custom-participants');
    const saveBtn = document.getElementById('save-custom-scenario');
    const cancelBtn = document.getElementById('cancel-custom-scenario');

    saveBtn?.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();
        const category = categorySelect.value;
        const difficulty = diffSelect.value;
        const participants = participantsInput.value
            .split(',')
            .map(p => p.trim())
            .filter(Boolean);

        if (!title || !description || !category || !difficulty || participants.length === 0) {
            showAlert('Please fill in all fields.');
            return;
        }

        const scenario = AppState.addCustomScenario({
            title,
            description,
            category,
            difficulty,
            participants
        });

        // Reset and close form
        titleInput.value = '';
        descInput.value = '';
        categorySelect.value = '';
        diffSelect.value = '';
        participantsInput.value = '';

        AppState.toggleCustomForm();
        document.getElementById('custom-form-container').innerHTML = '';
        document.getElementById('custom-form-container').style.display = 'none';
        document.getElementById('custom-scenario-toggle').style.display = 'block';

        // Re-render scenarios
        updateScenarioCards(AppState.getFilteredScenarios());
        setupScenarioSelectionListeners();

        showAlert('Custom scenario created! You can now select it.');
    });

    cancelBtn?.addEventListener('click', () => {
        AppState.toggleCustomForm();
        document.getElementById('custom-form-container').innerHTML = '';
        document.getElementById('custom-form-container').style.display = 'none';
        document.getElementById('custom-scenario-toggle').style.display = 'block';
    });
}

/**
 * Go to Agent Configuration Page
 */
function goToAgentConfig() {
    // Update the agent config page with current state
    const page = document.querySelector('[data-page="agentConfig"]');
    if (page && AppState.selectedScenario) {
        const content = renderAgentConfigPage(AppState.selectedScenario, AppState.selectedAgentIndices);
        // Extract inner HTML by removing the outer div
        const innerContent = content.substring(
            content.indexOf('>') + 1,
            content.lastIndexOf('</div>')
        );
        page.innerHTML = innerContent;
    }

    AppState.setPage('agentConfig');

    // Setup agent page events (defer to allow DOM rendering)
    setTimeout(() => setupAgentPageEvents(), 0);
}

/**
 * Go to Debate Page
 */
function goToDebate() {
    // Update debate page with current state
    const page = document.querySelector('[data-page="debate"]');
    if (page && AppState.selectedScenario) {
        const content = renderDebatePage(AppState.selectedScenario, AppState.selectedAgentIndices);
        // Extract inner HTML by removing the outer div
        const innerContent = content.substring(
            content.indexOf('>') + 1,
            content.lastIndexOf('</div>')
        );
        page.innerHTML = innerContent;
    }

    AppState.setPage('debate');

    // Setup debate page events
    setTimeout(() => setupDebatePageEvents(), 0);
}

/**
 * Go to Results Page
 */
function goToResults(results) {
    // Update results page with current state and results
    const page = document.querySelector('[data-page="results"]');
    if (page && AppState.selectedScenario) {
        const content = renderResultsPage(AppState.selectedScenario, AppState.selectedAgentIndices, results);
        // Extract inner HTML by removing the outer div
        const innerContent = content.substring(
            content.indexOf('>') + 1,
            content.lastIndexOf('</div>')
        );
        page.innerHTML = innerContent;
    }

    AppState.setPage('results');

    // Setup results page events
    setTimeout(() => setupResultsPageEvents(), 0);
}

/**
 * Setup Debate Page Events
 */
function setupDebatePageEvents() {
    const backBtn = document.getElementById('debate-back-btn');
    const startBtn = document.getElementById('start-debate-simulation');

    backBtn?.addEventListener('click', () => {
        AppState.setPage('agentConfig');
    });

    startBtn?.addEventListener('click', () => {
        startBtn.disabled = true;
        startBtn.textContent = '⏳ Debate in Progress...';
        simulateDebate();
    });
}

/**
 * Simulate Debate (with mock data for now)
 */
function simulateDebate() {
    const chatMessages = document.getElementById('chat-messages');
    const agents = AppState.selectedAgentIndices.map(idx => AGENT_BANK[idx]);
    
    // Clear placeholder
    chatMessages.innerHTML = '';

    // Mock debate messages
    const rounds = [
        { title: 'Round 1: Opening Arguments', messages: generateRound1Messages(agents) },
        { title: 'Round 2: Rebuttals', messages: generateRound2Messages(agents) },
        { title: 'Round 3: Closing Position', messages: generateRound3Messages(agents) }
    ];

    let currentRoundIndex = 0;
    let messageIndex = 0;

    function displayNextMessage() {
        if (currentRoundIndex >= rounds.length) {
            // Debate complete
            finishDebateSimulation();
            return;
        }

        const round = rounds[currentRoundIndex];
        const msg = round.messages[messageIndex];

        if (!msg) {
            // Move to next round
            currentRoundIndex++;
            messageIndex = 0;
            
            if (currentRoundIndex < rounds.length) {
                // Add round title
                const roundTitle = document.createElement('div');
                roundTitle.style.cssText = 'text-align: center; margin: var(--spacing-lg) 0; font-weight: 600; color: var(--primary); font-size: 1.1rem;';
                roundTitle.textContent = rounds[currentRoundIndex].title;
                chatMessages.appendChild(roundTitle);
            }
            
            displayNextMessage();
            return;
        }

        // Add message bubble
        const bubble = createChatBubble(msg.agent, msg.text);
        chatMessages.appendChild(bubble);
        
        // Update score
        const scoreEl = document.getElementById(`score-agent-${AppState.selectedAgentIndices.indexOf(msg.agentIdx)}`);
        if (scoreEl) {
            scoreEl.textContent = `Score: ${msg.score}`;
        }

        messageIndex++;

        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Display next message after delay
        setTimeout(displayNextMessage, 2000);
    }

    // Start with round 1 title
    const roundTitle = document.createElement('div');
    roundTitle.style.cssText = 'text-align: center; margin: var(--spacing-lg) 0; font-weight: 600; color: var(--primary); font-size: 1.1rem;';
    roundTitle.textContent = rounds[0].title;
    chatMessages.appendChild(roundTitle);

    displayNextMessage();
}

/**
 * Create chat bubble element
 */
function createChatBubble(agent, text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `
        <div style="font-size: 1.5rem; line-height: 1;">${agent.avatar}</div>
        <div class="bubble-content">
            <div class="bubble-agent">${agent.name}</div>
            <div class="bubble-text">${text}</div>
        </div>
    `;
    return bubble;
}

/**
 * Generate Round 1 messages
 */
function generateRound1Messages(agents) {
    const messages = [
        {
            agent: agents[0],
            agentIdx: AppState.selectedAgentIndices[0],
            text: `As the ${agents[0].role}, I believe we must prioritize ${['public safety and regulatory compliance', 'individual rights and privacy', 'sustainable business innovation', 'community well-being', 'technical feasibility'][AppState.selectedAgentIndices[0]]}. This scenario requires careful consideration of multiple stakeholder interests.`,
            score: 7
        },
        {
            agent: agents[1],
            agentIdx: AppState.selectedAgentIndices[1],
            text: `While I respect that perspective, the evidence clearly shows that ${['a balanced approach is needed', 'fundamental rights must never be compromised', 'innovation drives long-term value', 'grassroots solutions work best', 'technical limitations require honest discussion'][AppState.selectedAgentIndices[1]]}. We cannot ignore the implications for those most affected.`,
            score: 8
        },
    ];
    
    if (agents[2]) {
        messages.push({
            agent: agents[2],
            agentIdx: AppState.selectedAgentIndices[2],
            text: `Excellent points from both perspectives. From my standpoint, the critical factor is ${['maintaining institutional trust', 'protecting vulnerable populations', 'creating sustainable solutions', 'ensuring democratic participation', 'implementing viable systems'][AppState.selectedAgentIndices[2]]}. We need a framework that serves all parties effectively.`,
            score: 7
        });
    }

    return messages;
}

/**
 * Generate Round 2 messages
 */
function generateRound2Messages(agents) {
    return agents.slice(0, 3).map((agent, idx) => ({
        agent,
        agentIdx: AppState.selectedAgentIndices[idx],
        text: `I respectfully challenge the previous argument because ${['the data suggests a different approach', 'rights cannot be traded for convenience', 'practical implementation requires flexibility', 'participation levels show strong community support', 'technical standards exist for good reason'][AppState.selectedAgentIndices[idx]]}. Let me present evidence supporting my position...`,
        score: 6 + Math.random() * 3
    }));
}

/**
 * Generate Round 3 messages
 */
function generateRound3Messages(agents) {
    return agents.slice(0, 2).map((agent, idx) => ({
        agent,
        agentIdx: AppState.selectedAgentIndices[idx],
        text: `In closing, my proposed policy recommendation is: ${['Establish clear regulatory frameworks with stakeholder oversight and regular review cycles', 'Enshrine individual consent requirements with independent auditing mechanisms', 'Create innovation-friendly rules that balance growth with accountability', 'Implement community-centered governance structures with transparent decision-making', 'Develop technical standards that are both rigorous and practically deployable'][AppState.selectedAgentIndices[idx]]}. This approach addresses the core concerns we've discussed.`,
        score: 8
    }));
}

/**
 * Finish Debate and Show Results
 */
function finishDebateSimulation() {
    // Mock results
    const agents = AppState.selectedAgentIndices.map(idx => AGENT_BANK[idx]);
    const scores = {};
    
    AppState.selectedAgentIndices.forEach((idx, pos) => {
        scores[idx] = (7 + Math.random() * 3).toFixed(1);
    });

    const winnerIdx = AppState.selectedAgentIndices.reduce((maxIdx, idx, pos) => {
        return parseFloat(scores[idx]) > parseFloat(scores[maxIdx]) ? idx : maxIdx;
    });

    const winner = AGENT_BANK[winnerIdx];

    const mockResults = {
        winner,
        winnerScore: parseFloat(scores[winnerIdx]),
        scores,
        policyRecommendation: `Based on the debate consensus, the recommended approach combines ${winner.role}'s emphasis on ${['regulatory stability', 'rights protection', 'practical innovation', 'community needs', 'technical rigor'][winnerIdx]} with acknowledgment of alternative perspectives. Implementation should include stakeholder monitoring and adaptive governance mechanisms.`,
        transcript: []
    };

    // Navigate to results page
    goToResults(mockResults);
}

/**
 * Setup Results Page Events
 */
function setupResultsPageEvents() {
    const backBtn = document.getElementById('results-back-btn');
    const restartBtn = document.getElementById('restart-debate-btn');
    const homeBtn = document.getElementById('home-btn');
    const transcriptBtn = document.getElementById('view-transcript-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');
    const shareBtn = document.getElementById('share-results-btn');

    backBtn?.addEventListener('click', () => {
        AppState.setPage('scenario');
    });

    restartBtn?.addEventListener('click', () => {
        AppState.setPage('home');
    });

    homeBtn?.addEventListener('click', () => {
        AppState.setPage('home');
    });

    transcriptBtn?.addEventListener('click', () => {
        showAlert('View full transcript - Coming soon! Full debate will be displayed.');
    });

    pdfBtn?.addEventListener('click', () => {
        showAlert('PDF export functionality - Coming soon! Download debate results as PDF.');
    });

    shareBtn?.addEventListener('click', () => {
        showAlert('Debate link copied to clipboard!\nShare URL: ' + window.location.href);
    });
}

/**
 * Setup Agent Configuration Page Events
 */
function setupAgentPageEvents() {
    const agentPage = document.querySelector('[data-page="agentConfig"]');
    if (!agentPage) return;

    const backBtn = agentPage.querySelector('#agentconfig-back-btn');
    const toggles = agentPage.querySelectorAll('.agent-toggle');
    const startBtn = agentPage.querySelector('#start-debate-btn');
    const customizeBtns = agentPage.querySelectorAll('.agent-customize');

    // Back button
    backBtn?.addEventListener('click', () => {
        AppState.setPage('scenario');
    });

    // Agent toggles
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const idx = parseInt(toggle.getAttribute('data-agent-idx'));
            AppState.toggleAgent(idx);
            updateAgentUI(AppState.selectedAgentIndices);
        });
    });

    // Start debate button
    startBtn?.addEventListener('click', () => {
        if (AppState.selectedAgentIndices.length >= 2) {
            goToDebate();
        } else {
            showAlert('Please select at least 2 agents to start the debate.');
        }
    });

    // Customize buttons (placeholder functionality)
    customizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showAlert('Agent customization coming soon!');
        });
    });
}

/**
 * Start the App
 */
document.addEventListener('DOMContentLoaded', initApp);
