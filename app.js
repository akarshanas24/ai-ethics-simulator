// ==================== MAIN APP CONTROLLER ====================

const API_BASE = 'http://localhost:8000';

// Global error overlay to surface uncaught errors instead of a blank white page
(function installErrorOverlay(){
    function showOverlay(msg) {
        try {
            let ov = document.getElementById('js-error-overlay');
            if (!ov) {
                ov = document.createElement('div');
                ov.id = 'js-error-overlay';
                ov.style.position = 'fixed';
                ov.style.top = '0';
                ov.style.left = '0';
                ov.style.right = '0';
                ov.style.background = '#fff3f3';
                ov.style.color = '#800';
                ov.style.zIndex = 99999;
                ov.style.padding = '12px';
                ov.style.fontFamily = 'monospace';
                ov.style.maxHeight = '40vh';
                ov.style.overflow = 'auto';
                document.body.appendChild(ov);
            }
            ov.innerText = msg;
        } catch (e) {
            console.error('Failed to show overlay', e);
        }
    }

    window.addEventListener('error', function(ev){
        const msg = `Uncaught Error: ${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`;
        console.error(msg, ev.error);
        showOverlay(msg + '\n' + (ev.error && ev.error.stack ? ev.error.stack : ''));
    });

    window.addEventListener('unhandledrejection', function(ev){
        const reason = ev.reason || ev;
        const msg = 'Unhandled Promise Rejection: ' + (reason && reason.message ? reason.message : String(reason));
        console.error(msg, reason);
        showOverlay(msg + '\n' + (reason && reason.stack ? reason.stack : ''));
    });
})();

/**
 * API Client
 */
const ApiClient = {
    async createDebate(scenario, agentIndices, agents) {
        try {
            console.log('📤 Creating debate...', { scenario, agentIndices, agents });
            const response = await fetch(`${API_BASE}/debates/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario, agent_indices: agentIndices, agents })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log('✅ Debate created:', data);
            return data;
        } catch (error) {
            console.error('❌ Create debate failed:', error);
            throw error;
        }
    },

    async startDebate(debateId) {
        try {
            console.log('📤 Starting debate:', debateId);
            const response = await fetch(`${API_BASE}/debates/${debateId}/start`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log('✅ Debate started:', data);
            return data;
        } catch (error) {
            console.error('❌ Start debate failed:', error);
            throw error;
        }
    },

    streamDebate(debateId, onMessage) {
        console.log('📡 Connecting to debate stream:', debateId);
        const eventSource = new EventSource(`${API_BASE}/debates/${debateId}/stream`);
        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                console.log('📨 Stream event:', payload.type, payload);
                onMessage(payload);
            } catch (e) {
                console.error('❌ Failed to parse message:', e);
            }
        };
        eventSource.onerror = () => {
            console.error('❌ SSE connection error');
            eventSource.close();
        };
        eventSource.onopen = () => {
            console.log('✅ SSE connection established');
        };
        return eventSource;
    },

    async getResults(debateId) {
        try {
            console.log('📤 Fetching results:', debateId);
            const response = await fetch(`${API_BASE}/debates/${debateId}/results`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log('✅ Results fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Get results failed:', error);
            throw error;
        }
    },

    async getSummary(debateId) {
        try {
            const response = await fetch(`${API_BASE}/debates/${debateId}/summary`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('❌ Get summary failed:', error);
            throw error;
        }
    },

    async exportPDF(debateId) {
        window.open(`${API_BASE}/debates/${debateId}/export-pdf`, '_blank');
    }
};

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
    currentDebateId: null,
    currentEventSource: null,

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
    console.log('🚀 initApp() starting...');
    console.log('✓ renderHomePage defined?', typeof renderHomePage);
    console.log('✓ renderScenarioPage defined?', typeof renderScenarioPage);
    console.log('✓ renderAgentConfigPage defined?', typeof renderAgentConfigPage);
    console.log('✓ renderDebatePage defined?', typeof renderDebatePage);
    console.log('✓ renderResultsPage defined?', typeof renderResultsPage);
    
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
    // Get current selections from AppState and call orchestration
    if (!AppState.selectedScenario) {
        showAlert('Please select a scenario first');
        return;
    }
    if (AppState.selectedAgentIndices.length < 2) {
        showAlert('Please select at least 2 agents');
        return;
    }
    
    // Call the real orchestration from debate-orchestration.js
    startDebateOrchestration(AppState.selectedScenario, AppState.selectedAgentIndices);
}

/**
 * Go to Results Page
 */
function goToResults(results) {
    const page = document.querySelector('[data-page="results"]');
    if (page) {
        page.innerHTML = renderResultsPage(results);
    }
    AppState.setPage('results');
    setTimeout(() => setupResultsPageEvents(), 0);
}

/**
 * Setup Debate Page Events
 */
function setupDebatePageEvents() {
    const backBtn = document.getElementById('debate-back-btn');
    const startBtn = document.getElementById('start-debate-simulation');

    backBtn?.addEventListener('click', () => {
        if (AppState.currentEventSource) {
            AppState.currentEventSource.close();
        }
        AppState.setPage('agentConfig');
    });

    startBtn?.addEventListener('click', () => {
        startBtn.disabled = true;
        startBtn.textContent = '⏳ Debate in Progress...';
        // Debate already started in goToDebate via backend
    });
}

/**
 * Setup Results Page Events
 */
function setupResultsPageEvents() {
    const backBtn = document.getElementById('results-back-btn');
    const restartBtn = document.getElementById('restart-debate-btn');
    const homeBtn = document.getElementById('home-btn');
    const transcriptHeader = document.getElementById('transcript-header');
    const transcriptContent = document.getElementById('transcript-content');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const shareBtn = document.getElementById('share-results-btn');
    const viewTranscriptBtn = document.getElementById('view-transcript-btn');

    backBtn?.addEventListener('click', () => {
        AppState.setPage('scenario');
        if (AppState.currentEventSource) {
            AppState.currentEventSource.close();
        }
    });

    restartBtn?.addEventListener('click', () => {
        AppState.setPage('home');
        if (AppState.currentEventSource) {
            AppState.currentEventSource.close();
        }
    });

    homeBtn?.addEventListener('click', () => {
        AppState.setPage('home');
        if (AppState.currentEventSource) {
            AppState.currentEventSource.close();
        }
    });

    transcriptHeader?.addEventListener('click', () => {
        if (transcriptContent) {
            transcriptContent.style.display = transcriptContent.style.display === 'none' ? 'block' : 'none';
        }
    });

    viewTranscriptBtn?.addEventListener('click', () => {
        if (transcriptContent) {
            transcriptContent.style.display = transcriptContent.style.display === 'none' ? 'block' : 'none';
        }
    });

    exportPdfBtn?.addEventListener('click', () => {
        if (AppState.currentDebateId) {
            ApiClient.exportPDF(AppState.currentDebateId);
        }
    });

    shareBtn?.addEventListener('click', () => {
        if (AppState.currentDebateId) {
            const shareUrl = `${window.location.origin}?debate=${AppState.currentDebateId}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Debate link copied to clipboard!');
            });
        }
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
    startBtn?.addEventListener('click', async () => {
        console.log('🟢 Start Debate clicked', {
            scenario: AppState.selectedScenario,
            agents: AppState.selectedAgentIndices
        });
        try {
            if (AppState.selectedAgentIndices.length >= 2) {
                // Call goToDebate and guard against exceptions
                try {
                    goToDebate();
                } catch (e) {
                    console.error('Error invoking goToDebate():', e);
                    showAlert('Failed to start debate (internal). Check console for details.');
                }
            } else {
                showAlert('Please select at least 2 agents to start the debate.');
            }
        } catch (err) {
            console.error('Unhandled error in start button handler:', err);
            showAlert('An unexpected error occurred. See console for details.');
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
