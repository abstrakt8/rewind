import { injectable } from "inversify";
import { BehaviorSubject, Subject } from "rxjs";

const getNowInMs = () => performance.now();

@injectable()
export class GameplayClock {
  public isPlaying$: BehaviorSubject<boolean>;
  public durationInMs$: BehaviorSubject<number>;
  public speed$: BehaviorSubject<number>;

  public seeked$: Subject<number>;

  // Things that get updated very often should not be Subjects due to performance issues
  public timeElapsedInMs = 0;
  private lastUpdateTimeInMs = 0;

  // private eventEmitter: EventEmitter;

  constructor() {
    this.isPlaying$ = new BehaviorSubject<boolean>(false);
    this.durationInMs$ = new BehaviorSubject<number>(0);
    this.speed$ = new BehaviorSubject<number>(1);
    this.seeked$ = new Subject<number>();
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

  get speed() {
    return this.speed$.getValue();
  }

  set speed(value: number) {
    this.speed$.next(value);
  }

  get durationInMs() {
    return this.durationInMs$.getValue();
  }

  set durationInMs(value: number) {
    this.durationInMs$.next(Number.isNaN(value) ? 0 : value);
  }

  get isPlaying() {
    return this.isPlaying$.getValue();
  }

  set isPlaying(value: boolean) {
    this.isPlaying$.next(value);
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
  }

  pause() {
    if (!this.isPlaying) return;
    this.updateTimeElapsed();
    this.isPlaying = false;
  }

  setSpeed(speed: number) {
    this.updateTimeElapsed();
    this.speed = speed;
  }

  setDuration(durationInMs: number) {
    console.debug(`GameClock duration has been set to ${durationInMs}ms`);
    this.durationInMs = durationInMs;
  }

  seekTo(timeInMs: number) {
    timeInMs = Math.min(this.durationInMs, Math.max(0, timeInMs));
    this.timeElapsedInMs = timeInMs;
    this.lastUpdateTimeInMs = getNowInMs();
    this.seeked$.next(timeInMs);
  }

  clear() {
    this.pause();
    this.speed$.next(1.0);
    // This is just ahot fix
    this.durationInMs$.next(1);
    this.timeElapsedInMs = 0;
  }
}
