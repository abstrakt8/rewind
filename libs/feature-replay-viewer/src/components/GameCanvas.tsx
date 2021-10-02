import React, { useEffect, useRef } from "react";
import { useAnalysisApp } from "../providers/TheaterProvider";
import { Box } from "@mui/material";
import { ignoreFocus } from "../utils/IgnoreFocus";

export const GameCanvas = () => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const analysisApp = useAnalysisApp();

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
    <Box ref={containerRef} sx={{ borderRadius: 2, overflow: "auto", position: "relative", flex: 1 }}>
      <canvas
        style={{ width: "100%", height: "100%", pointerEvents: "none", borderRadius: 2 }}
        ref={canvas}
        // This does not work
      />
    </Box>
  );
};
