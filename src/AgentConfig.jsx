import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Switch,
  Stack,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const CARD_SIZE = 340; // square size for agent cards

const AGENT_BANK = [
  {
    name: "Dr. Sarah Chen",
    role: "Government Official",
    avatar: "🧑‍⚖️",
    ethical: "Represents public policy and regulatory perspectives with focus on social welfare and law enforcement.",
    framework: "Utilitarian with legal constraints",
    personality: "Authoritative, methodical, considers public safety and legal precedent"
  },
  {
    name: "Marcus Rodriguez",
    role: "Human Rights Advocate",
    avatar: "🧑‍🎓",
    ethical: "Champions individual privacy, civil liberties, and protection of vulnerable populations.",
    framework: "Deontological rights-based approach",
    personality: "Passionate, principled, questions authority and advocates for the marginalized"
  },
  {
    name: "Alexandra Thompson",
    role: "Business Executive",
    avatar: "🧑‍💼",
    ethical: "Focuses on economic viability, innovation, and competitive advantages in ethical decision-making.",
    framework: "Consequentialist with market considerations",
    personality: "Pragmatic, results-oriented, balances ethics with business sustainability"
  },
  {
    name: "Jamie Park",
    role: "Community Representative",
    avatar: "🧑‍🤝‍🧑",
    ethical: "Voices everyday concerns and practical implications for ordinary citizens.",
    framework: "Common-sense morality with community values",
    personality: "Relatable, concerned with practical impacts, represents diverse community views"
  },
  {
    name: "Dr. Alex Kumar",
    role: "Technology Expert",
    avatar: "🧑‍🔬",
    ethical: "Provides technical insights on AI capabilities, limitations, and implementation challenges.",
    framework: "Evidence-based with technological realism",
    personality: "Analytical, detail-oriented, focuses on technical feasibility and accuracy"
  }
];

export default function AgentConfig({ selectedScenario }) {
  const [enabled, setEnabled] = useState([0, 1, 2, 3]); // All selected by default

  // Toggle selection; at least two required to enable debate
  const handleToggle = idx => {
    if (enabled.includes(idx)) {
      setEnabled(enabled.filter(i => i !== idx));
    } else {
      setEnabled([...enabled, idx]);
    }
  };

  const selectedAgents = enabled.map(i => AGENT_BANK[i]);

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f6f8fc",
        pb: 8,
        px: { xs: 1, sm: 2, md: 6 }
      }}
    >
      <Button
        variant="text"
        sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}
        onClick={() => window.location.reload()}
      >
        ← Back to Scenarios
      </Button>
      <Typography variant="h3" fontWeight="bold" color="#1976d2" sx={{ mb: 1 }}>
        Configure AI Agents
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Select and customize the AI agents that will participate in your ethical debate.
      </Typography>
      <Card
        sx={{ mb: 4, p: 3, borderLeft: "4px solid #1976d2", background: "#fff" }}
        elevation={1}
      >
        <Typography fontWeight="bold">
          Selected Scenario: {selectedScenario.title}
        </Typography>
        <Typography color="text.secondary" fontSize={16}>
          {selectedScenario.description}
        </Typography>
      </Card>
      {/* Header with summary */}
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#1976d2" }}
          >
            <span role="img" aria-label="agents" style={{ marginRight: 6 }}>
              👥
            </span>
            Available Agents
          </Typography>
          <Chip
            label={`${enabled.length} selected`}
            color="primary"
            sx={{ fontWeight: "bold" }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Minimum 2 agents required • {enabled.length >= 2 ? "✓ Ready to proceed" : "Select at least 2 agents"}
        </Typography>
      </Box>
      {/* Agents grid, square cards */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 5,
          maxWidth: "100vw",
          margin: "0"
        }}
      >
        {AGENT_BANK.map((agent, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agent.name} sx={{ display: "flex", justifyContent: "center" }}>
            <Card
              sx={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                minWidth: CARD_SIZE,
                minHeight: CARD_SIZE,
                maxWidth: CARD_SIZE,
                maxHeight: CARD_SIZE,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                p: 3,
                outline: enabled.includes(idx)
                  ? "2px solid #1976d2"
                  : "1.5px solid #dee5f2",
                borderRadius: 3,
                background: "#fff",
                boxShadow: enabled.includes(idx) ? "0 0 6px #1976d244" : "none",
                transition: "outline 0.2s",
                overflow: "hidden"
              }}
              elevation={enabled.includes(idx) ? 3 : 0}
            >
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <span style={{ fontSize: 28, marginRight: 10 }}>{agent.avatar}</span>
                  <Box>
                    <Typography fontWeight="bold" sx={{ fontSize: 18, lineHeight: 1 }}>
                      {agent.name}
                    </Typography>
                    <Chip
                      label={agent.role}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontWeight: "bold", mt: 0.5 }}
                    />
                  </Box>
                  <Switch
                    checked={enabled.includes(idx)}
                    onChange={() => handleToggle(idx)}
                    sx={{ ml: "auto" }}
                    color="primary"
                  />
                </Box>
                <Typography fontSize={15} sx={{
                  mb: 1,
                  maxHeight: 36,
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>{agent.ethical}</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: "#556" }}>Ethical Framework:</Typography>
                <Typography fontSize={14}
                  sx={{ mb: 0.5, maxHeight: 32, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {agent.framework}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: "#556" }}>Personality:</Typography>
                <Typography fontSize={14}
                  sx={{ mb: 1.5, maxHeight: 32, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {agent.personality}
                </Typography>
              </Box>
              <Button fullWidth variant="outlined" startIcon={<EditOutlinedIcon />}>
                Customize
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Active summary box */}
      <Card
        sx={{
          maxWidth: "100%",
          mx: "auto",
          p: 3,
          background: "#fff",
          borderRadius: 3,
          boxShadow: 1
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          <span role="img" aria-label="summary">⚙️</span> Debate Configuration Summary
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Active Participants ({enabled.length}):
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
          {selectedAgents.map((agent) => (
            <Chip
              key={agent.name}
              icon={<span style={{ fontSize: "1.2em", marginLeft: 2 }}>{agent.avatar}</span>}
              label={`${agent.name} - ${agent.role}`}
              size="medium"
              variant="outlined"
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {enabled.length >= 2
            ? "Ready to start the ethical debate simulation"
            : "Select at least 2 agents to enable debate"}
        </Typography>
        <Button
          size="large"
          variant="contained"
          color="primary"
          disabled={enabled.length < 2}
          endIcon={<ArrowForwardIcon />}
          sx={{ minWidth: 180 }}
          onClick={() => alert("Simulation will start!")}
        >
          Start Debate
        </Button>
      </Card>
    </Box>
  );
}
