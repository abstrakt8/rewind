import { Box, Paper, Stack, Typography } from "@mui/material";
import { PlayBar } from "./components/PlayBar";
import { useEffect } from "react";
import { useShortcuts } from "./hooks/useShortcuts";
import { GameCanvas } from "./components/GameCanvas";
import { useAnalysisApp } from "./providers/TheaterProvider";
import { SettingsModal } from "./components/SettingsModal";
import { SettingsModalProvider } from "./providers/SettingsProvider";

function useInitializeAnalyzer() {
  const analyzer = useAnalysisApp();
  useEffect(() => {
    console.log("Analyzer: Initialized.");
    analyzer.initialize();
    return () => analyzer.destroy();
  }, [analyzer]);
}

export function Analyzer() {
  useInitializeAnalyzer();
  useShortcuts();

  return (
    <SettingsModalProvider>
      <SettingsModal />
      <Stack
        sx={{
          p: 2,
          flexGrow: 1,
          height: "100%",
        }}
        gap={2}
      >
        <GameCanvas />
        <Paper elevation={1} sx={{ boxShadow: "none" }}>
          <PlayBar />
        </Paper>
      </Stack>
    </SettingsModalProvider>
  );
}
