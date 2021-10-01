import { Box, Paper, Stack, Typography } from "@mui/material";
import { PlayBar } from "./components/PlayBar";
import { GameCanvas, useAnalysisApp } from "@rewind/feature-replay-viewer";
import { useEffect } from "react";

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

export function Analyzer() {
  useInitializeAnalyzer();

  return (
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
  );
}
