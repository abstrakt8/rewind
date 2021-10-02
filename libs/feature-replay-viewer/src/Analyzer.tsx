import { Box, Modal, Paper, Stack, Typography } from "@mui/material";
import { PlayBar } from "./components/PlayBar";
import { useEffect, useState } from "react";
import { useShortcuts } from "./hooks/useShortcuts";
import { GameCanvas } from "./components/GameCanvas";
import { useAnalysisApp } from "./providers/TheaterProvider";
import { SettingsModal } from "./components/SettingsModal";
import { useSettingsModalContext } from "./providers/SettingsProvider";

const CanvasPlaceHolder = () => (
  <Box
    flexGrow={1}
    display={"flex"}
    alignItems={"center"}
    justifyContent={"center"}
    sx={{ bgcolor: "black", borderRadius: 2 }}
  >
    <Typography>Canvas placeholder</Typography>
  </Box>
);

function useInitializeAnalyzer() {
  const analyzer = useAnalysisApp();
  useEffect(() => {
    console.log("Analyzer: Initialized.");
    analyzer.initialize();
    return () => analyzer.destroy();
  }, [analyzer]);
}

function MySettingsModal() {
  const { onSettingsModalOpenChange, settingsModalOpen } = useSettingsModalContext();
  const onClose = () => onSettingsModalOpenChange(false);

  return (
    <Modal open={settingsModalOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1028,
          height: 728,
        }}
      >
        <SettingsModal onClose={onClose} />
      </Box>
    </Modal>
  );
}

export function Analyzer() {
  useInitializeAnalyzer();
  useShortcuts();

  return (
    <>
      <MySettingsModal />
      <Stack
        sx={{
          p: 2,
          flexGrow: 1,
          height: "100%",
        }}
        gap={2}
      >
        <GameCanvas />
        {/*<CanvasPlaceHolder />*/}
        <Paper elevation={1} sx={{ boxShadow: "none" }}>
          <PlayBar />
        </Paper>
      </Stack>
    </>
  );
}
