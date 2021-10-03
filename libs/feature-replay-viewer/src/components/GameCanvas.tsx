import React, { useEffect, useRef } from "react";
import { useAnalysisApp } from "../providers/TheaterProvider";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useObservable } from "rxjs-hooks";
import { LightningBoltIcon } from "@heroicons/react/solid";
import InfoIcon from "@mui/icons-material/Info";

function EmptyState() {
  return (
    <Stack gap={2} alignItems={"center"}>
      <Stack gap={1} alignItems={"center"}>
        <InfoIcon sx={{ height: "2em", width: "2em" }} />
        <Typography>No replay loaded</Typography>
      </Stack>
      <Stack gap={1} alignItems={"center"} direction={"row"}>
        <Box component={LightningBoltIcon} sx={{ height: "1em", color: "text.secondary" }} />
        <Typography color={"text.secondary"}>
          In osu! press F2 while being at a score/fail screen to load the replay
        </Typography>
      </Stack>
    </Stack>
  );
}

export const GameCanvas = () => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const analysisApp = useAnalysisApp();
  const { status } = useObservable(() => analysisApp.scenarioManager.scenario$, { status: "DONE" });

  const showOverlay = status !== "DONE";

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.append(analysisApp.stats());
    }
  }, [analysisApp]);
  useEffect(() => {
    if (canvas.current) {
      console.log("Initializing renderer to the canvas");
      analysisApp.initializeRenderer(canvas.current);
    }
    return () => analysisApp.destroyRenderer();
  }, [analysisApp]);

  return (
    <Box ref={containerRef} sx={{ borderRadius: 2, overflow: "hidden", position: "relative", flex: 1 }}>
      <canvas
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        ref={canvas}
        // This does not work
      />
      {/*Overlay*/}
      {showOverlay && (
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            top: "0",
            left: "0",
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          {status === "INIT" && <EmptyState />}
          {status === "LOADING" && <CircularProgress />}
          {status === "ERROR" && <Typography>Something wrong happened...</Typography>}
        </Box>
      )}
    </Box>
  );
};
