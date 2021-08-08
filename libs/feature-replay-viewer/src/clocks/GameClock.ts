export interface GameClock {
  // Should return the time of the game in milliseconds.
  getCurrentTime: () => number;
  start: () => void;
  pause: () => void;
  togglePlaying: () => boolean;
  seekTo: (time: number) => void;

  currentSpeed: number;
  isPlaying: boolean;
  setSpeed(speed: number): void;
  maxTime: number;
}
