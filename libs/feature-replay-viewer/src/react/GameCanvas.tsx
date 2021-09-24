import React, { useEffect, useRef } from "react";
import { useAnalysisApp } from "./components/TheaterProvider/TheaterProvider";

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
    <div ref={containerRef} className={"overflow-auto flex-1 rounded relative"}>
      <canvas className={"w-full h-full bg-black pointer-events-none"} ref={canvas} />
    </div>
  );
};
