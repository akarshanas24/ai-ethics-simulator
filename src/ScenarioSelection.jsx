import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  TextField,
  Stack,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";

const categories = [
  "Transportation Ethics",
  "Workplace Fairness",
  "Privacy vs Security",
  "Healthcare Ethics",
];

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const initialScenarios = [
  {
    title: "Autonomous Vehicle Dilemma",
    description:
      "Should a self-driving car prioritize passenger safety over pedestrian safety when faced with an unavoidable accident?",
    category: "Transportation Ethics",
    difficulty: "Intermediate",
    participants: [
      "Government Official",
      "Human Rights Advocate",
      "Businessperson",
      "Citizen",
    ],
  },
  {
    title: "AI Hiring Algorithm Bias",
    description:
      "An AI hiring system shows bias against certain demographic groups. Should it be discontinued or can the bias be corrected?",
    category: "Workplace Fairness",
    difficulty: "Advanced",
    participants: [
      "Human Rights Advocate",
      "Businessperson",
      "Tech Expert",
      "Citizen",
    ],
  },
  {
    title: "Facial Recognition Surveillance",
    description:
      "Should facial recognition technology be used in public spaces for security purposes despite privacy concerns?",
    category: "Privacy vs Security",
    difficulty: "Beginner",
    participants: [
      "Government Official",
      "Human Rights Advocate",
      "Citizen",
      "Tech Expert",
    ],
  },
  {
    title: "AI Medical Diagnosis Priority",
    description:
      "An AI system can predict health risks but requires access to sensitive personal data. Where should the line be drawn?",
    category: "Healthcare Ethics",
    difficulty: "Advanced",
    participants: [
      "Government Official",
      "Human Rights Advocate",
      "Businessperson",
      "Citizen",
    ],
  },
];

const difficultyColor = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "error",
};

export default function ScenarioSelection({ onSelectScenario }) {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [customScenarioMode, setCustomScenarioMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState("");
  const [customParticipants, setCustomParticipants] = useState("");
  const [scenarios, setScenarios] = useState(initialScenarios);

  const categoriesWithAll = ["All Categories", ...categories];

  const filteredScenarios = scenarios.filter((sc) => {
    const matchesCategory =
      selectedCategory === "All Categories" || sc.category === selectedCategory;
    const matchesSearch =
      sc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveCustomScenario = () => {
    if (
      !customTitle.trim() ||
      !customDescription.trim() ||
      !customCategory ||
      !customDifficulty ||
      !customParticipants.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }
    const newScenario = {
      title: customTitle.trim(),
      description: customDescription.trim(),
      category: customCategory,
      difficulty: customDifficulty,
      participants: customParticipants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    };
    setScenarios([...scenarios, newScenario]);
    setCustomTitle("");
    setCustomDescription("");
    setCustomCategory("");
    setCustomDifficulty("");
    setCustomParticipants("");
    setCustomScenarioMode(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        overflowX: "hidden",
        background: "#f6f8fc",
        p: 0,
        m: 0,
      }}
    >
      <Box sx={{ width: "100%", px: { xs: 2, md: 8 }, py: 6 }}>
        <Button
          variant="text"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
          onClick={() => window.location.reload()}
        >
          ← Back to Welcome
        </Button>
        <Typography
          variant="h3"
          fontWeight="bold"
          align="left"
          gutterBottom
          color="#1976d2"
        >
          Choose Your Ethical Scenario
        </Typography>
        <Typography
          variant="h6"
          align="left"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Select a pre-built ethical dilemma or create your own custom scenario
          for AI agents to debate.
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search scenarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: "100%", maxWidth: 480, mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
          {categoriesWithAll.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              color={selectedCategory === cat ? "primary" : "default"}
              onClick={() => setSelectedCategory(cat)}
              clickable
              sx={{ fontWeight: "bold" }}
            />
          ))}
        </Stack>
        {!customScenarioMode && (
          <Button
            variant="outlined"
            sx={{
              mb: 4,
              py: 1.5,
              px: 2.5,
              display: "block",
              fontWeight: "bold",
            }}
            onClick={() => setCustomScenarioMode(true)}
          >
            + Create Custom Scenario
          </Button>
        )}

        <Grid
          container
          spacing={4}
          sx={{
            width: "100%",
            marginLeft: "0 !important",
            marginRight: "0 !important",
          }}
        >
          {filteredScenarios.map((sc, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={sc.title + idx}
              sx={{ display: "flex" }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  width: 330,
                  minHeight: 335,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                  background: "#fff",
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Chip
                      size="small"
                      label={sc.category}
                      color="info"
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={sc.difficulty}
                      color={difficultyColor[sc.difficulty]}
                    />
                  </Stack>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {sc.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1 }}
                    color="text.secondary"
                  >
                    {sc.description}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Participants:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {sc.participants.map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  sx={{ mt: 2, width: "100%" }}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => onSelectScenario(sc)}
                >
                  Select Scenario
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {customScenarioMode && (
          <Card
            elevation={4}
            sx={{ mt: 5, p: 4, borderRadius: 3, background: "#f9f9fd" }}
          >
            <Typography variant="h5" gutterBottom>
              Create Custom Scenario
            </Typography>
            <TextField
              label="Title"
              fullWidth
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <Select
              label="Category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select Category
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Difficulty"
              value={customDifficulty}
              onChange={(e) => setCustomDifficulty(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select Difficulty
              </MenuItem>
              {difficulties.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Participants (comma separated)"
              fullWidth
              value={customParticipants}
              onChange={(e) => setCustomParticipants(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="e.g., Government Official, Citizen"
            />
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleSaveCustomScenario}
            >
              Save Scenario
            </Button>
            <Button
              variant="text"
              onClick={() => setCustomScenarioMode(false)}
            >
              Cancel
            </Button>
          </Card>
        )}
      </Box>
    </Box>
  );
}
