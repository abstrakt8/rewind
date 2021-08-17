import { useCallback, useEffect, useState } from "react";
import { useStageContext } from "../components/StageProvider/StageProvider";
import { useInterval } from "./useInterval";

export function useGameClock() {
  const { stage } = useStageContext();
  const { clock } = stage;
  return clock;
}

const speedsAllowed = [0.25, 0.75, 1.0, 1.5, 2.0, 4.0];
// TODO: FLOATING POINT EQUALITY ALERT
const speedIndex = (speed: number) => speedsAllowed.indexOf(speed);
const nextSpeed = (speed: number) => speedsAllowed[Math.min(speedsAllowed.length - 1, speedIndex(speed) + 1)];
const prevSpeed = (speed: number) => speedsAllowed[Math.max(0, speedIndex(speed) - 1)];

const frameJump = 16;

// Probably need a React.Context
export function useGameClockControls() {
  const clock = useGameClock();

  const [isPlaying, setIsPlaying] = useState(clock.isPlaying);
  const [speed, setSpeed] = useState(clock.speed);
  const [durationInMs] = useState(clock.durationInMs);

  // Since the clock can be paused on its own we want to listen to those changes.
  useEffect(() => {
    clock.onStarted(() => setIsPlaying(true));
    clock.onPaused(() => setIsPlaying(false));
    clock.onSpeedChange((speed) => setSpeed(speed));
  }, [clock]);

  const startClock = useCallback(() => clock.start(), [clock]);
  const pauseClock = useCallback(() => clock.pause(), [clock]);
  const toggleClock = useCallback(() => (isPlaying ? clock.pause() : clock.start()), [clock, isPlaying]);
  const increaseSpeed = useCallback(() => clock.setSpeed(nextSpeed(clock.speed)), [clock]);
  const decreaseSpeed = useCallback(() => clock.setSpeed(prevSpeed(clock.speed)), [clock]);

  return {
    isPlaying,
    speed,
    durationInMs,
    startClock,
    pauseClock,
    toggleClock,
    increaseSpeed,
    decreaseSpeed,
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
