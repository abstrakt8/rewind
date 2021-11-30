import React, { useEffect, useRef } from "react";
import { useAnalysisApp } from "../providers/TheaterProvider";
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useObservable } from "rxjs-hooks";
import { LightningBoltIcon } from "@heroicons/react/solid";
import InfoIcon from "@mui/icons-material/Info";
import { ignoreFocus } from "../utils/IgnoreFocus";
import CloseIcon from "@mui/icons-material/Close";

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
      <Stack gap={1} alignItems={"center"} direction={"row"}>
        <Box component={LightningBoltIcon} sx={{ height: "1em", color: "text.secondary" }} />
        <Typography color={"text.secondary"}>
          You can also load a replay with the menu action "File &gt; Open Replay (Ctrl+O)"
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
    if (status === "INIT") {
      analysisApp.stats().hidden = true;
    } else {
      analysisApp.stats().hidden = false;
    }
  }, [status, analysisApp]);

  useEffect(() => {
    if (canvas.current) {
      console.log("Initializing renderer to the canvas");
      analysisApp.onEnter(canvas.current);
    }
    return () => analysisApp.onHide();
  }, [analysisApp]);

  return (
    <Box ref={containerRef} sx={{ borderRadius: 2, overflow: "hidden", position: "relative", flex: 1 }}>
      {status === "DONE" && (
        <Tooltip title={"Close replay"}>
          <IconButton
            sx={{ position: "absolute", right: "0", top: "0" }}
            onClick={() => analysisApp.scenarioManager.clearReplay()}
            onFocus={ignoreFocus}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      )}
      <canvas
        style={{
          width: "100%",
          height: "100%",
          // , pointerEvents: "none"
        }}
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
