import { SliderPath } from "./slider/SliderPath";
import { Position, Vec2 } from "@rewind/osu/math";
import { HitCircle } from "./HitCircle";
import { SliderCheckPoint } from "./SliderCheckPoint";
import { HasId } from "./Properties";
import { HitObjectType } from "./Types";

export class Slider implements HasId {
  // scoring distance with a speed-adjusted beat length of 1 second (i.e. the speed slider balls
  // move through their track).
  static BASE_SCORING_DISTANCE = 100;

  id = "";

  head: HitCircle;

  path: SliderPath = new SliderPath([]);
  checkPoints: SliderCheckPoint[] = [];
  velocity = 1;
  tickDistance = 0;
  tickDistanceMultiplier = 1;
  legacyLastTickOffset?: number;
  repeatCount = 0;

  constructor(hitCircle: HitCircle) {
    this.head = hitCircle;
  }

  get type(): HitObjectType {
    return "SLIDER";
  }

  get spawnTime(): number {
    return this.head.spawnTime;
  }

  // Number of times the slider spans over the screen.
  get spanCount(): number {
    return this.repeatCount + 1;
  }

  get scale(): number {
    return this.head.scale;
  }

  get radius(): number {
    return this.head.radius;
  }

  get spanDuration(): number {
    return this.duration / this.spanCount;
  }

  get duration(): number {
    return this.endTime - this.startTime;
  }

  get startTime(): number {
    return this.head.hitTime;
  }

  get endTime(): number {
    return this.startTime + (this.spanCount * this.path.distance) / this.velocity;
  }

  get startPosition(): Position {
    return this.head.position;
  }

  get endPosition(): Position {
    // TODO: Caching like in osu!lazer since this takes a lot of time
    return Vec2.add(this.head.position, this.ballOffsetAt(1.0));
  }

  /**
   * Returns the absolute position of the ball given the progress p, where p is the percentage of time passed
   * between startTime and endTime.
   * @param progress
   */
  ballPositionAt(progress: number): Position {
    return Vec2.add(this.head.position, this.ballOffsetAt(progress));
  }

  /**
   * Returns the position given the (time) progress. Basically it just tells you where the slider ball should be after
   * p% of time has passed.
   *
   * @param progress number between 0 and 1 determining the time progress
   */
  ballOffsetAt(progress: number): Position {
    const spanProgress = progress * this.spanCount;
    let progressInSpan = spanProgress % 1.0;
    // When it's "returning" we should consider the progress in an inverted way.
    if (Math.floor(spanProgress) % 2 === 1) {
      progressInSpan = 1.0 - progressInSpan;
    }
    return this.path.positionAt(progressInSpan);
  }
}
