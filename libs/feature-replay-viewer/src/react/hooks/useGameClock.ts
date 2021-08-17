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
  const [speed] = useState(clock.speed);
  const [durationInMs] = useState(clock.durationInMs);

  // Since the clock can be paused on its own we want to listen to those changes.
  useEffect(() => {
    clock.onStarted(() => setIsPlaying(true));
    clock.onPaused(() => setIsPlaying(false));
  }, [clock]);

  const startClock = useCallback(() => clock.start(), [clock]);
  const pauseClock = useCallback(() => clock.pause(), [clock]);
  const toggleClock = useCallback(() => (isPlaying ? clock.pause() : clock.start()), [clock, isPlaying]);

  return {
    isPlaying,
    speed,
    durationInMs,
    startClock,
    pauseClock,
    toggleClock,
  };
}

const GAME_TIME_SYNC_INTERVAL_IN_MS = 32;

export function usePartiallySyncedGameClockTime() {
  const clock = useGameClock();
  const [timeInMs, setTimeInMs] = useState(clock.timeElapsedInMs);

  // The gameClock.tick() is handled in the game loop and we will only "listen/sync" to what ever the game clock is
  // displaying.
  useInterval(() => {
    setTimeInMs(clock.timeElapsedInMs);
  }, GAME_TIME_SYNC_INTERVAL_IN_MS);

  // This will immediately sync with the timeElapsed otherwise it looks a bit weird if the
  // GAME_TIME_SYNC_INTERVAL_IN_MS is set to 1s and the game time is synced only after 1 second.
  useEffect(() => {
    clock.onPaused(() => setTimeInMs(clock.timeElapsedInMs));
  }, [clock]);

  return timeInMs;
}
