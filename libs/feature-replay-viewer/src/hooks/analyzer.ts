import { useAnalysisApp } from "@rewind/feature-replay-viewer";
import { useCallback } from "react";
import { useObservable } from "rxjs-hooks";
import { throttleTime } from "rxjs/operators";

export function useGameClockControls() {
  const analyzer = useAnalysisApp();

  const gameClock = analyzer.gameClock;

  const toggleClock = useCallback(() => gameClock.toggle(), [gameClock]);
  const isPlaying = useObservable(() => gameClock.isPlaying$, false);
  const seekTo = useCallback((timeInMs: number) => gameClock.seekTo(timeInMs), [gameClock]);

  return {
    toggleClock,
    isPlaying,
    seekTo,
  };
}

// 60FPS by default
export function useGameClockTime(fps = 60) {
  const analyzer = useAnalysisApp();
  return useObservable(() => analyzer.gameClock.timeElapsedInMs$.pipe(throttleTime(1000 / fps)), 0);
}
