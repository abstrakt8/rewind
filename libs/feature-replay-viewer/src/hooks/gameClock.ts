import { useAnalysisApp } from "@rewind/feature-replay-viewer";
import { useCallback } from "react";
import { useObservable } from "rxjs-hooks";
import { throttleTime } from "rxjs/operators";

export function useGameClock() {
  const analyzer = useAnalysisApp();
  return analyzer.gameClock;
}

export function useGameClockControls() {
  const gameClock = useGameClock();

  const isPlaying = useObservable(() => gameClock.isPlaying$, false);
  const duration = useObservable(() => gameClock.durationInMs$, 0);
  const speed = useObservable(() => gameClock.speed$, 1.0);

  const toggleClock = useCallback(() => gameClock.toggle(), [gameClock]);
  const seekTo = useCallback((timeInMs: number) => gameClock.seekTo(timeInMs), [gameClock]);

  return {
    toggleClock,
    duration,
    speed,

    isPlaying,
    seekTo,
  };
}

// 60FPS by default
export function useGameClockTime(fps = 60) {
  const gameClock = useGameClock();
  return useObservable(() => gameClock.timeElapsedInMs$.pipe(throttleTime(1000 / fps)), 0);
}
