import React, { useState } from "react";
import { Box, Container, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ScenarioSelection from "./ScenarioSelection";
import AgentConfig from "./AgentConfig";  // Make sure to create this file!

const features = [
  { title: "Multi-Agent Perspectives", description: "AI agents representing diverse ethical viewpoints engage in structured debates.", icon: "👥" },
  { title: "Real-Time Debates", description: "Agents present arguments, counterpoints, and rebuttals in natural language.", icon: "💬" },
  { title: "Decision Analytics", description: "Visualize voting patterns, argument strength, and ethical principle usage.", icon: "📊" },
  { title: "Customizable Scenarios", description: "Choose from built dilemmas or create your own ethical scenarios.", icon: "⚙️" }
];

const onboardingSteps = [
  { step: 1, title: "Choose a Scenario", description: "Select from ethical dilemmas like autonomous vehicles, AI hiring, or facial recognition" },
  { step: 2, title: "Configure AI Agents", description: "Customize AI personas with distinct ethical values and debate priorities" },
  { step: 3, title: "Run the Debate", description: "Watch multi-agent dialogue unfold with arguments and counterpoints" },
  { step: 4, title: "Review Outcomes", description: "Analyze votes, summaries, and visualizations of the ethical decision" },
];

function HowItWorksSection({ setPage }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Container maxWidth="md" sx={{ my: 8 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
        How It Works
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Get started with AI ethics simulation in four simple steps
      </Typography>
      <Box sx={{
        maxWidth: 600,
        mx: "auto",
        minHeight: 260,
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 6px 32px rgba(60,80,120,0.08)",
        p: 5,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Stepper Circles */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3, gap:2 }}>
          {onboardingSteps.map((step, idx) => (
            <Box key={step.title} sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: idx === activeStep ? "#1976d2" : "#e0e7ef",
              transition: "background 0.3s",
              mx: 0.5,
              display: "inline-block",
              boxShadow: idx === activeStep ? "0 1px 12px #1976d2" : undefined
            }} />
          ))}
        </Box>
        {/* Step Number in Circle */}
        <Box sx={{
          background: "#1976d2",
          color: "#fff",
          fontWeight: "bold",
          width: 48,
          height: 48,
          lineHeight: "48px",
          fontSize: 24,
          borderRadius: "50%",
          boxShadow: "0 2px 8px #1976d2aa",
          mb: 2,
          textAlign: "center",
          transition: "background 0.3s"
        }}>
          {onboardingSteps[activeStep].step}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, textAlign:"center" }}>
          {onboardingSteps[activeStep].title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign:"center" }}>
          {onboardingSteps[activeStep].description}
        </Typography>
        {/* Previous/Next buttons INSIDE the box */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap:2 }}>
          <Button
            variant="outlined"
            size="medium"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="medium"
            disabled={activeStep === onboardingSteps.length - 1}
            onClick={() => setActiveStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1))}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          sx={{ borderRadius: 3, px: 5 }}
          onClick={() => setPage("scenario")}
        >
          Begin Your First Simulation &nbsp;→
        </Button>
      </Box>
    </Container>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedScenario, setSelectedScenario] = useState(null);

  const handleStartSimulation = () => setPage("scenario");

  const handleScenarioSelect = scenario => {
    setSelectedScenario(scenario);
    setPage("agentConfig");
  };

  if (page === "scenario") {
    return <ScenarioSelection onSelectScenario={handleScenarioSelect} />;
  }

  if (page === "agentConfig" && selectedScenario) {
    // FULL PAGE, no margins
    return (
      <Box sx={{ minHeight: "100vh", width: "100vw", background: "#f6f8fc" }}>
        <AgentConfig selectedScenario={selectedScenario} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f3f9" }}>
      {/* Hero Section */}
      <Box sx={{ width: "100vw", minHeight: "45vh", background: "linear-gradient(135deg, #60a3d9 0%, #3b5998 100%)", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pt: 8, pb: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2, textShadow: "0 1px 6px rgba(0,0,0,0.18)", fontSize: { xs: "2.5rem", md: "3.5rem" } }}>
            AI Ethics Simulator
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 700, margin: "0 auto", mb: 4, fontWeight: 400, fontSize: { xs: "1rem", md: "1.35rem" } }}>
            Simulate multi-agent debates on AI ethics in real-time. Explore complex ethical dilemmas through diverse AI perspectives.
          </Typography>
          <Button variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 4, px: 4, fontWeight: "bold", fontSize: "1.1rem", background: "#1976d2", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} onClick={handleStartSimulation}>
            Start Simulation
          </Button>
        </Container>
      </Box>
      {/* Why AI Ethics Simulation Section */}
      <Box sx={{ width: "100vw", py: 7, backgroundColor: "#f4f9fd" }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 8 } }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
            Why AI Ethics Simulation Matters
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: "auto" }}>
            Understanding ethical implications of AI decisions requires exploring multiple perspectives. Our simulator creates a safe space to examine complex moral questions before they impact the real world.
          </Typography>
          {/* Features in Single Row */}
          <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ flexWrap: "nowrap !important", overflowX: "auto" }}>
            {features.map(({ title, description, icon }) => (
              <Grid item xs={12} sm={6} md={3} key={title} sx={{ minWidth: 280 }}>
                <Card elevation={3} sx={{ borderRadius: 3, textAlign: "center", px: 3, py: 6, minHeight: 230 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>{icon}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary">{description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* How It Works Section */}
      <HowItWorksSection setPage={setPage} />
    </Box>
  );
}
