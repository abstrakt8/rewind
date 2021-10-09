import { TemporaryObjectPool } from "../../../utils/pooling/TemporaryObjectPool";
import { Container, Sprite, Texture } from "pixi.js";
import { TimeInterval, TimeIntervals } from "@rewind/osu/core";

/**
 *
 * Questions:
 * 1. Dynamic: depending on beatmap?
 * 2.
 * 3. HitCircles shown or not
 */

// Can efficiently determine which time intervals are visible assuming that they are *static* and non intersecting such
// as key presses.
// More specifically, it finds all time intervals [start, end] that intersect with [time, time + timeWindow]

function timeIntervalIntersection(a: TimeInterval, b: TimeInterval) {
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

class NonIntersectingTimeIntervalsTracker {
  constructor(private readonly intervals: TimeIntervals, private timeWindow: number) {}

  findIntervals(time: number) {
    // dummy implementation can be improved with sliding window
    const w: TimeInterval = [time, time + this.timeWindow];
    const res: number[] = [];
    for (let i = 0; i < this.intervals.length; i++) {
      const t = timeIntervalIntersection(this.intervals[i], w);
      if (t[0] < t[1]) {
        res.push(i);
      }
    }
    return res;
  }

  changeTimeWindow(timeWindow: number) {
    this.timeWindow = timeWindow;
    // TODO: Should reset some work
  }
}

// interface KeyPressOverlayRowSettings {
//
//
// }

const keyPressOverlayWidth = 720;
const keyPressOverlayHeight = 200;

export class KeyPressOverlayRow {
  spritePool: TemporaryObjectPool<Sprite>;
  tracker: NonIntersectingTimeIntervalsTracker;
  container: Container;

  constructor(private timeIntervals: TimeIntervals, private hitWindowTime: number) {
    this.spritePool = new TemporaryObjectPool<Sprite>(
      () => new Sprite(),
      (g) => {
        // unexpected arrow function
      },
      { initialSize: 10 },
    );
    this.tracker = new NonIntersectingTimeIntervalsTracker(timeIntervals, hitWindowTime);
    this.container = new Container();
  }

  update(time: number) {
    const intervalsIndices: number[] = this.tracker.findIntervals(time);
    const mainWindow: TimeInterval = [-this.hitWindowTime + time, time + this.hitWindowTime];

    this.container.removeChildren();

    for (const i of intervalsIndices) {
      const interval = this.timeIntervals[i];
      const [sprite] = this.spritePool.allocate("timeInterval" + i);
      sprite.texture = Texture.WHITE;

      const intersection = timeIntervalIntersection(mainWindow, interval);
      sprite.width = intersection[1] - intersection[0];
      sprite.height = 100;
      sprite.position.set(intersection[0]);
      this.container.addChild(sprite);
    }

    this.spritePool.releaseUntouched();
  }
}

// As a reusable component
// interface KeyPressOverlaySettings {}

export class KeyPressOverlay {
  private lastTime = 0;
  public container: Container;
  private key1: KeyPressOverlayRow;
  private key2: KeyPressOverlayRow;

  constructor() {
    this.container = new Container();
    this.key1 = new KeyPressOverlayRow([], 3);
    this.key2 = new KeyPressOverlayRow([], 3);
    this.container.addChild(this.key1.container, this.key2.container);
    this.key1.container.position.set(0, 100);
    this.key2.container.position.set(0, 200);
  }

  onTimeWindowChange(timeWindow: number) {
    this.key1.tracker.changeTimeWindow(timeWindow);
    this.key2.tracker.changeTimeWindow(timeWindow);
  }

  // onReplayChange() {
  //   // give me new time intervals
  // }

  update(currentTime: number) {
    this.key1.update(currentTime);
    this.key2.update(currentTime);
  }
}
