import { GameClock } from "./GameClock";
import { makeAutoObservable } from "mobx";

/**
 * A simple clock implementation that uses the JS `performance.now()`
 */
export class PerformanceGameClock implements GameClock {
  private _lastStartTime = -1;
  private elapsed = 0;

  public playbackRate = 1;
  public isPlaying = false;

  constructor() {
    makeAutoObservable(this);
  }

  start() {
    if (!this.isPlaying) {
      this._lastStartTime = performance.now();
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.elapsed += this.timePassedSinceStart();
      this._lastStartTime = -1;
    }
  }

  togglePlaying() {
    if (this.isPlaying) this.pause();
    else this.start();
    return this.isPlaying;
  }

  private timePassedSinceStart() {
    return (performance.now() - this._lastStartTime) * this.playbackRate;
  }

  getCurrentTime() {
    return this.elapsed + (this.isPlaying ? this.timePassedSinceStart() : 0);
  }

  seekTo(time: number) {
    this.elapsed = time;
    if (this.isPlaying) {
      this._lastStartTime = performance.now();
    }
  }

  setSpeed(speed: number): void {
    const wasPlaying = this.isPlaying;
    // We remember the time so far and start with a new playbackRate
    if (wasPlaying) this.pause();
    this.playbackRate = speed;
    if (wasPlaying) this.start();
  }

  get currentSpeed(): number {
    return this.playbackRate;
  }
}
