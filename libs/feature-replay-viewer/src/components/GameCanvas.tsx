import React, { useEffect, useRef } from "react";
import { useAnalysisApp } from "../providers/TheaterProvider";
import { Box } from "@mui/material";

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
    <Box ref={containerRef} sx={{ borderRadius: 2, overflow: "auto", position: "relative", flexGrow: 1 }}>
      {/*<Box sx={{ backgroundColor: "red", height: "100%", width: "100%" }}>Test</Box>*/}
      <canvas
        style={{ width: "100%", height: "100%", pointerEvents: "none", backgroundColor: "pink", borderRadius: 2 }}
        ref={canvas}
      />
    </Box>
    // <div ref={containerRef} className={"overflow-auto flex-1 rounded relative"}>
    // </div>
  );
};
