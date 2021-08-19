import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useInterval } from "../../hooks/useInterval";
import { GameplayClock } from "../../../app/stage/core/GameplayClock";

const speedsAllowed = [0.25, 0.75, 1.0, 1.5, 2.0, 4.0];
// TODO: FLOATING POINT EQUALITY ALERT
const speedIndex = (speed: number) => speedsAllowed.indexOf(speed);
const nextSpeed = (speed: number) => speedsAllowed[Math.min(speedsAllowed.length - 1, speedIndex(speed) + 1)];
const prevSpeed = (speed: number) => speedsAllowed[Math.max(0, speedIndex(speed) - 1)];

const GAME_TIME_SYNC_INTERVAL_IN_MS = 32;

// Probably need a React.Context
function useGameClockControls(clock: GameplayClock) {
  const [isPlaying, setIsPlaying] = useState(clock.isPlaying);
  const [speed, setSpeed] = useState(clock.speed);
  const [durationInMs, setDurationInMs] = useState(clock.durationInMs);

  // Since the clock can be paused on its own we want to listen to those changes.
  useEffect(() => {
    clock.onStarted(() => setIsPlaying(true));
    clock.onPaused(() => setIsPlaying(false));
    clock.onSpeedChange((speed) => setSpeed(speed));
    clock.onDurationChange((durationInMs) => setDurationInMs(durationInMs));
  }, [clock]);

  const startClock = useCallback(() => clock.start(), [clock]);
  const pauseClock = useCallback(() => clock.pause(), [clock]);
  const toggleClock = useCallback(() => (isPlaying ? clock.pause() : clock.start()), [clock, isPlaying]);
  const increaseSpeed = useCallback(() => clock.setSpeed(nextSpeed(clock.speed)), [clock]);
  const decreaseSpeed = useCallback(() => clock.setSpeed(prevSpeed(clock.speed)), [clock]);
  const seekForward = useCallback((timeInMs) => clock.seekTo(clock.timeElapsedInMs + timeInMs), [clock]);
  const seekBackward = useCallback((timeInMs) => clock.seekTo(clock.timeElapsedInMs - timeInMs), [clock]);

  // TODO: Immediately sync time again
  const seekTo = useCallback((timeInMs) => clock.seekTo(timeInMs), [clock]);

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

  return {
    isPlaying,
    speed,
    durationInMs,
    startClock,
    pauseClock,
    toggleClock,
    increaseSpeed,
    decreaseSpeed,
    seekForward,
    seekBackward,
    timeInMs,
    seekTo,
  };
}

const GameClockContext = createContext<ReturnType<typeof useGameClockControls>>(null!);

interface GameClockProviderProps {
  clock: GameplayClock;
  children: ReactNode;
}

export function GameClockProvider({ clock, children }: GameClockProviderProps) {
  const controls = useGameClockControls(clock);
  return <GameClockContext.Provider value={controls}>{children}</GameClockContext.Provider>;
}

export function useGameClockContext() {
  const context = useContext(GameClockContext);
  if (!context) {
    throw Error("useGameClockContext can only be used within a GameClockProvider");
  }
  return context;
}
