import { TemporaryObjectPool } from "../../../utils/pooling/TemporaryObjectPool";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { calculateReplayClicks, TimeInterval, TimeIntervals } from "@rewind/osu/core";
import { injectable } from "inversify";
import { ReplayManager } from "../../../apps/analysis/manager/ReplayManager";
import { GameplayClock } from "../../../core/game/GameplayClock";

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
  constructor(public intervals: TimeIntervals, public timeWindow: number) {}

  findIntervals(time: number) {
    // dummy implementation can be improved with sliding window
    const w: TimeInterval = [-this.timeWindow + time, time + this.timeWindow];
    const res: number[] = [];
    for (let i = 0; i < this.intervals.length; i++) {
      const t = timeIntervalIntersection(this.intervals[i], w);
      if (t[0] < t[1]) {
        res.push(i);
      }
    }
    return res;
  }
}

// interface KeyPressOverlayRowSettings {
//
//
// }

const WIDTH = 800;
const HEIGHT = 100;
const KEY_HEIGHT = 25;

export class KeyPressOverlayRow {
  spritePool: TemporaryObjectPool<Sprite>;
  tracker: NonIntersectingTimeIntervalsTracker;
  container: Container;

  constructor(timeIntervals: TimeIntervals, hitWindowTime: number) {
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
    const mainWindow: TimeInterval = [-this.tracker.timeWindow + time, time + this.tracker.timeWindow];
    const pastWindow: TimeInterval = [-this.tracker.timeWindow + time, time];
    const futureWindow: TimeInterval = [time, time + this.tracker.timeWindow];

    this.container.removeChildren();

    const msToPx = (x: number) => ((x - mainWindow[0]) / (this.tracker.timeWindow * 2)) * WIDTH;

    for (const i of intervalsIndices) {
      const interval = this.tracker.intervals[i];

      {
        const pastIntersection = timeIntervalIntersection(pastWindow, interval);
        if (pastIntersection[0] < pastIntersection[1]) {
          // const [sprite] = this.spritePool.allocate("pastTimeInterval" + i);
          const sprite = new Sprite();
          sprite.texture = Texture.WHITE;
          sprite.width = ((pastIntersection[1] - pastIntersection[0]) / (this.tracker.timeWindow * 2)) * WIDTH;
          sprite.height = KEY_HEIGHT;
          sprite.position.set(msToPx(pastIntersection[0]), 0);
          sprite.alpha = 0.8;
          this.container.addChild(sprite);
        }
      }
      {
        const futureIntersection = timeIntervalIntersection(futureWindow, interval);
        if (futureIntersection[0] < futureIntersection[1]) {
          // const [sprite] = this.spritePool.allocate("futureTimeInterval" + i);
          const sprite = new Sprite();
          sprite.texture = Texture.WHITE;
          sprite.width = ((futureIntersection[1] - futureIntersection[0]) / (this.tracker.timeWindow * 2)) * WIDTH;
          sprite.height = KEY_HEIGHT;
          sprite.position.set(msToPx(futureIntersection[0]), 0);
          sprite.alpha = 0.05;
          this.container.addChild(sprite);
        }
      }

      // console.log(`width=${sprite.width} height=${sprite.height} position=[${intersection[0]}]`);
    }
    // console.log(`IntervalsIndices.length= ${intervalsIndices.length}`);

    // const futureMask = new Sprite(Texture.WHITE);
    // futureMask.tint = 0x111111;
    // futureMask.alpha = 0.9;
    // futureMask.width = WIDTH / 2;
    // futureMask.height = HEIGHT / 2;
    // futureMask.position.set(WIDTH / 2, 0);
    // this.container.addChild(futureMask);
    // this.container.filters = [new AlphaFilter(0.1)];
    // this.container.filterArea = new Rectangle(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
    this.spritePool.releaseUntouched();
  }
}

// As a reusable component
// interface KeyPressOverlaySettings {}

const defaultTimeWindow = 500;

export class KeyPressOverlay {
  public container: Container;
  private key1: KeyPressOverlayRow;
  private key2: KeyPressOverlayRow;

  constructor() {
    this.container = new Container();
    this.container.width = WIDTH;
    this.container.height = HEIGHT;

    // Just for debugging
    {
      const rectangle = new Graphics();
      rectangle.lineStyle(2, 0xffffff);
      rectangle.drawRect(0, 0, WIDTH, HEIGHT);
      this.container.addChild(rectangle);
    }
    this.key1 = new KeyPressOverlayRow([], defaultTimeWindow);
    this.key2 = new KeyPressOverlayRow([], defaultTimeWindow);
    this.container.addChild(this.key1.container, this.key2.container);
    const margin = 10;
    this.key1.container.position.set(0, margin);
    this.key2.container.position.set(0, HEIGHT - KEY_HEIGHT - margin);

    {
      const middleLine = new Sprite(Texture.WHITE);
      middleLine.width = 1;
      middleLine.height = HEIGHT;
      middleLine.alpha = 0.4;
      middleLine.position.set(WIDTH / 2, 0);
      this.container.addChild(middleLine);
    }

    {
      const tickHeight = 5,
        tickWidth = 1;
      const tickAlpha = 0.2;

      for (let i = 0; i <= 100; i += 5) {
        // Bottom
        {
          const tick = new Sprite(Texture.WHITE);
          tick.width = tickWidth;
          tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
          tick.alpha = tickAlpha;
          tick.position.set(WIDTH / 2 - i, HEIGHT - tick.height);
          this.container.addChild(tick);
        }

        // Top
        {
          const tick = new Sprite(Texture.WHITE);
          tick.width = tickWidth;
          tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
          tick.alpha = tickAlpha;
          tick.position.set(WIDTH / 2 - i, 0);
          this.container.addChild(tick);
        }
      }
    }
  }

  onTimeWindowChange(timeWindow: number) {
    this.key1.tracker.timeWindow = timeWindow;
    this.key2.tracker.timeWindow = timeWindow;
  }

  onKeyPressesChange(timeIntervals: TimeIntervals[]) {
    this.key1.tracker.intervals = timeIntervals[0];
    this.key2.tracker.intervals = timeIntervals[1];
  }

  update(currentTime: number) {
    this.key1.update(currentTime);
    this.key2.update(currentTime);
  }
}

@injectable()
export class KeyPressOverlayPreparer {
  keyPressOverlay: KeyPressOverlay;

  constructor(private readonly gameplayClock: GameplayClock, private readonly replayManager: ReplayManager) {
    this.keyPressOverlay = new KeyPressOverlay();

    this.replayManager.mainReplay$.subscribe((replay) => {
      if (replay === null) {
        this.keyPressOverlay.onKeyPressesChange([[], []]);
      } else {
        const clicks = calculateReplayClicks(replay.frames);
        console.log(`Calculated clicks: [${clicks[0].length}, ${clicks[1].length}]`);
        console.log(clicks);
        this.keyPressOverlay.onKeyPressesChange(clicks);
      }
    });
  }

  get container() {
    return this.keyPressOverlay.container;
  }

  update() {
    const time = this.gameplayClock.timeElapsedInMs;
    this.keyPressOverlay.update(time);
  }
}
