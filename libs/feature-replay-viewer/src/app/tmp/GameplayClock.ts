import { EventEmitter, GameClockEvents } from "../events";

const getCurrentTimeInMs = () => performance.now();

export class GameplayClock {
  public isPlaying = false;
  public speed = 1.0;
  public durationInMs = 0;
  public timeElapsedInMs = 0;
  private lastUpdateTimeInMs = 0;

  constructor(private eventEmitter: EventEmitter) {}

  // Tick should only be used once in each frame and for the rest of the frame one should refer to `timeElapsedInMs`.
  tick() {
    this.updateTimeElapsed();
    if (this.timeElapsedInMs > this.durationInMs) {
      this.pause();
      this.timeElapsedInMs = this.durationInMs;
    }
    return this.timeElapsedInMs;
  }

  updateTimeElapsed() {
    if (!this.isPlaying) return;
    const nowInMs = getCurrentTimeInMs();
    const delta = this.speed * (nowInMs - this.lastUpdateTimeInMs);
    this.timeElapsedInMs += delta;
    this.lastUpdateTimeInMs = nowInMs;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastUpdateTimeInMs = getCurrentTimeInMs();
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_STARTED);
  }

  pause() {
    if (!this.isPlaying) return;
    this.updateTimeElapsed();
    this.isPlaying = false;
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_PAUSED);
  }

  setSpeed(speed: number) {
    this.updateTimeElapsed();
    this.speed = speed;
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_SPEED_CHANGED);
  }

  seekTo(timeInMs: number) {
    this.timeElapsedInMs = timeInMs;
    this.lastUpdateTimeInMs = getCurrentTimeInMs();
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_SEEK);
  }
}
