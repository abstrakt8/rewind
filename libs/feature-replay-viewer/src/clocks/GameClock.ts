export interface GameClock {
  // Should return the time of the game in milliseconds.
  getCurrentTime: () => number;
  start: () => void;
  pause: () => void;
  seekTo: (time: number) => void;

  setSpeed(speed: number): void;
}
