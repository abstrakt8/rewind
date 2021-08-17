import { useCallback, useEffect, useState } from "react";
import { useStageContext } from "../components/StageProvider/StageProvider";
import { useInterval } from "./useInterval";

export function useGameClock() {
  const { stage } = useStageContext();
  const { clock } = stage;
  return clock;
}

export function useGameClockControls() {
  const clock = useGameClock();

  const [isPlaying, setIsPlaying] = useState(clock.isPlaying);

  // Since the clock can be paused on its own we want to listen to those changes.
  useEffect(() => {
    clock.onStarted(() => setIsPlaying(true));
    clock.onPaused(() => setIsPlaying(false));
  }, [clock]);

  const startClock = useCallback(() => clock.start(), [clock]);
  const pauseClock = useCallback(() => clock.pause(), [clock]);

  return {
    isPlaying,
    startClock,
    pauseClock,
  };
}

const GAME_TIME_SYNC_INTERVAL_IN_MS = 128;

export function usePartiallySyncedGameClockTime() {
  const clock = useGameClock();
  const [timeInMs, setTimeInMs] = useState(clock.timeElapsedInMs);

  // The gameClock.tick() is handled in the game loop and we will only "listen/sync" to what ever the game clock is
  // displaying.
  useInterval(() => {
    setTimeInMs(clock.timeElapsedInMs);
  }, GAME_TIME_SYNC_INTERVAL_IN_MS);

  return timeInMs;
}
