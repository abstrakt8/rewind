import { Paper, Stack } from "@mui/material";
import { PlayBar } from "./components/PlayBar";
import { useShortcuts } from "./hooks/useShortcuts";
import { GameCanvas } from "./components/GameCanvas";
import { SettingsModal } from "./components/SettingsModal";
import { SettingsModalProvider } from "./providers/SettingsProvider";

export function Analyzer() {
  // Short cuts will then only be available when this page is <Analyzer/> is open
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
