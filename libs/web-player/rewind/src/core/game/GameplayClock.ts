import { EventEmitter, GameClockEvents } from "../../events";
import { ListenerFn } from "eventemitter2";
import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../../types/STAGE_TYPES";
import { BehaviorSubject } from "rxjs";

const getNowInMs = () => performance.now();

@injectable()
export class GameplayClock {
  public isPlaying$: BehaviorSubject<boolean>;
  public timeElapsedInMs$: BehaviorSubject<number>;

  public speed = 1.0;
  public durationInMs = 0;
  private lastUpdateTimeInMs = 0;

  // private eventEmitter: EventEmitter;

  constructor(@inject(STAGE_TYPES.EVENT_EMITTER) private readonly eventEmitter: EventEmitter) {
    // this.eventEmitter = new EventEmitter();
    this.isPlaying$ = new BehaviorSubject<boolean>(false);
    this.timeElapsedInMs$ = new BehaviorSubject<number>(0);
  }

  /**
   * Tick should only be used once in each frame and for the rest of the frame one should refer to `timeElapsedInMs`.
   * This is to ensure that every related game object is referring to the same time at the same time.
   */
  tick() {
    this.updateTimeElapsed();
    if (this.timeElapsedInMs > this.durationInMs) {
      this.pause();
      this.timeElapsedInMs = this.durationInMs;
    }
    return this.timeElapsedInMs;
  }

  get isPlaying() {
    return this.isPlaying$.getValue();
  }

  set isPlaying(value: boolean) {
    this.isPlaying$.next(value);
  }

  get timeElapsedInMs() {
    return this.timeElapsedInMs$.getValue();
  }

  set timeElapsedInMs(value: number) {
    this.timeElapsedInMs$.next(value);
  }

  updateTimeElapsed() {
    if (!this.isPlaying) return;
    const nowInMs = getNowInMs();
    const deltaInMs = this.speed * (nowInMs - this.lastUpdateTimeInMs);
    this.timeElapsedInMs += deltaInMs;
    this.lastUpdateTimeInMs = nowInMs;
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.start();
  }

  start() {
    if (this.isPlaying) return;

    // TODO: Maybe
    // Resets it back to 0 in case the user wants to start the clock again when it already ended.
    if (this.timeElapsedInMs >= this.durationInMs) {
      // Will also emit an event
      this.seekTo(0);
    }
    this.isPlaying = true;
    this.lastUpdateTimeInMs = getNowInMs();
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
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_SPEED_CHANGED, speed);
  }

  setDuration(durationInMs: number) {
    console.log(`GameClock duration has been set to ${durationInMs}ms`);
    this.durationInMs = durationInMs;
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_DURATION_CHANGED, durationInMs);
  }

  seekTo(timeInMs: number) {
    timeInMs = Math.min(this.durationInMs, Math.max(0, timeInMs));
    this.timeElapsedInMs = timeInMs;
    this.lastUpdateTimeInMs = getNowInMs();
    this.eventEmitter.emit(GameClockEvents.GAME_CLOCK_SEEK, timeInMs);
  }

  onStarted(fn: ListenerFn) {
    this.eventEmitter.on(GameClockEvents.GAME_CLOCK_STARTED, fn);
  }

  onSpeedChange(fn: ListenerFn) {
    this.eventEmitter.on(GameClockEvents.GAME_CLOCK_SPEED_CHANGED, fn);
  }

  onPaused(fn: ListenerFn) {
    this.eventEmitter.on(GameClockEvents.GAME_CLOCK_PAUSED, fn);
  }

  onDurationChange(fn: ListenerFn) {
    this.eventEmitter.on(GameClockEvents.GAME_CLOCK_DURATION_CHANGED, fn);
  }
}
