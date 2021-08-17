import React, { useEffect, useRef } from "react";
import { useStageContext } from "./components/StageProvider/StageProvider";

export const GameCanvas = () => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { stage } = useStageContext();

  useEffect(() => {
    if (containerRef.current !== null) {
      containerRef.current.appendChild(stage.performanceMonitor.dom);
    }
  }, [stage]);
  useEffect(() => {
    if (canvas.current) {
      const destroy = stage.initializeRenderer(canvas.current);
      stage.initializeTicker();
      return () => destroy();
    }
    return () => {};
  }, [stage]);

  return (
    <div ref={containerRef} className={"overflow-auto flex-1 rounded relative"}>
      <canvas className={"w-full h-full bg-black"} ref={canvas} />
    </div>
  );
};
