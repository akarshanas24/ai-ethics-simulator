// ==================== DATA & CONFIGURATION ====================

// Categories for scenarios
const CATEGORIES = [
    "Transportation Ethics",
    "Workplace Fairness",
    "Privacy vs Security",
    "Healthcare Ethics",
];

// Difficulty levels
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

// Difficulty color mapping
const DIFFICULTY_COLORS = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "error",
};

// Predefined scenarios
const INITIAL_SCENARIOS = [
    {
        id: "av-dilemma",
        title: "Autonomous Vehicle Dilemma",
        description:
            "Should a self-driving car prioritize passenger safety over pedestrian safety when faced with an unavoidable accident?",
        category: "Transportation Ethics",
        difficulty: "Intermediate",
        participants: [
            "Government Official",
            "Human Rights Advocate",
            "Business Executive",
            "Community Representative",
        ],
    },
    {
        id: "ai-hiring",
        title: "AI Hiring Algorithm Bias",
        description:
            "An AI hiring system shows bias against certain demographic groups. Should it be discontinued or can the bias be corrected?",
        category: "Workplace Fairness",
        difficulty: "Advanced",
        participants: [
            "Human Rights Advocate",
            "Business Executive",
            "Technical Expert",
            "Community Representative",
        ],
    },
    {
        id: "facial-recognition",
        title: "Facial Recognition Surveillance",
        description:
            "Should facial recognition technology be used in public spaces for security purposes despite privacy concerns?",
        category: "Privacy vs Security",
        difficulty: "Beginner",
        participants: [
            "Government Official",
            "Human Rights Advocate",
            "Community Representative",
            "Technical Expert",
        ],
    },
    {
        id: "ai-medical",
        title: "AI Medical Diagnosis Priority",
        description:
            "An AI system can predict health risks but requires access to sensitive personal data. Where should the line be drawn?",
        category: "Healthcare Ethics",
        difficulty: "Advanced",
        participants: [
            "Government Official",
            "Human Rights Advocate",
            "Business Executive",
            "Community Representative",
        ],
    },
];

// AI Agent profiles
const AGENT_BANK = [
    {
        id: "gov-official",
        name: "Dr. Sarah Chen",
        role: "Government Official",
        avatar: "🧑‍⚖️",
        ethical: "Represents public policy and regulatory perspectives with focus on social welfare and law enforcement.",
        framework: "Utilitarian with legal constraints",
        personality: "Authoritative, methodical, considers public safety and legal precedent"
    },
    {
        id: "human-rights",
        name: "Marcus Rodriguez",
        role: "Human Rights Advocate",
        avatar: "🧑‍🎓",
        ethical: "Champions individual privacy, civil liberties, and protection of vulnerable populations.",
        framework: "Deontological rights-based approach",
        personality: "Passionate, principled, questions authority and advocates for the marginalized"
    },
    {
        id: "business-exec",
        name: "Alexandra Thompson",
        role: "Business Executive",
        avatar: "🧑‍💼",
        ethical: "Focuses on economic viability, innovation, and competitive advantages in ethical decision-making.",
        framework: "Consequentialist with market considerations",
        personality: "Pragmatic, results-oriented, balances ethics with business sustainability"
    },
    {
        id: "community-rep",
        name: "Jamie Park",
        role: "Community Representative",
        avatar: "🧑‍🤝‍🧑",
        ethical: "Voices everyday concerns and practical implications for ordinary citizens.",
        framework: "Common-sense morality with community values",
        personality: "Relatable, concerned with practical impacts, represents diverse community views"
    },
    {
        id: "tech-expert",
        name: "Dr. Alex Kumar",
        role: "Technical Expert",
        avatar: "🧑‍🔬",
        ethical: "Provides technical insights on AI capabilities, limitations, and implementation challenges.",
        framework: "Evidence-based with technological realism",
        personality: "Analytical, detail-oriented, focuses on technical feasibility and accuracy"
    }
];

// Features for home page
const FEATURES = [
    {
        title: "Multi-Agent Perspectives",
        description: "AI agents representing diverse ethical viewpoints engage in structured debates.",
        icon: "👥"
    },
    {
        title: "Real-Time Debates",
        description: "Agents present arguments, counterpoints, and rebuttals in natural language.",
        icon: "💬"
    },
    {
        title: "Decision Analytics",
        description: "Visualize voting patterns, argument strength, and ethical principle usage.",
        icon: "📊"
    },
    {
        title: "Customizable Scenarios",
        description: "Choose from built dilemmas or create your own ethical scenarios.",
        icon: "⚙️"
    }
];

// Onboarding steps
const ONBOARDING_STEPS = [
    {
        step: 1,
        title: "Choose a Scenario",
        description: "Select from ethical dilemmas like autonomous vehicles, AI hiring, or facial recognition"
    },
    {
        step: 2,
        title: "Configure AI Agents",
        description: "Customize AI personas with distinct ethical values and debate priorities"
    },
    {
        step: 3,
        title: "Run the Debate",
        description: "Watch multi-agent dialogue unfold with arguments and counterpoints"
    },
    {
        step: 4,
        title: "Review Outcomes",
        description: "Analyze votes, summaries, and visualizations of the ethical decision"
    },
];
