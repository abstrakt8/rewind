import { TemporaryObjectPool } from "../../../utils/pooling/TemporaryObjectPool";
import { Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import {
  calculateReplayClicks,
  isHitCircle,
  MainHitObject,
  OsuHitObject,
  TimeInterval,
  TimeIntervals,
} from "@rewind/osu/core";
import { injectable } from "inversify";
import { ReplayManager } from "../../../apps/analysis/manager/ReplayManager";
import { GameplayClock } from "../../../core/game/GameplayClock";
import { BeatmapManager } from "../../../apps/analysis/manager/BeatmapManager";
import { PixiRendererManager } from "../../PixiRendererManager";
import { DEFAULT_ANALYSIS_CURSOR_SETTINGS } from "@rewind/web-player/rewind";

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

  /**
   * Finds the intervals that intersect with time around the given timeWindow.
   * @returns the indices
   */
  findVisibleIndices(time: number) {
    // dummy implementation can be improved with sliding window
    const w: TimeInterval = createTimeWindow(time, this.timeWindow);
    const res: number[] = [];
    for (let i = 0; i < this.intervals.length; i++) {
      const t = timeIntervalIntersection(this.intervals[i], w);
      if (t[0] <= t[1]) {
        res.push(i);
      }
    }
    return res;
  }
}

const WIDTH = 800;
const HEIGHT = 100;
const KEY_HEIGHT = 25;

function positionInTimeline(currentTime: number, windowDuration: number, x: number) {
  return (
    ((x - currentTime + windowDuration) / (2 * windowDuration)) * // Percentage
    WIDTH
  );
}

export class KeyPressOverlayRow {
  spritePool: TemporaryObjectPool<Sprite>;
  tracker: NonIntersectingTimeIntervalsTracker;
  container: Container;
  tint = 0xffffff;

  constructor(timeIntervals: TimeIntervals, hitWindowTime: number) {
    this.spritePool = new TemporaryObjectPool<Sprite>(
      () => new Sprite(Texture.WHITE),
      (g) => {
        // unexpected arrow function
      },
      { initialSize: 10 },
    );
    this.tracker = new NonIntersectingTimeIntervalsTracker(timeIntervals, hitWindowTime);
    this.container = new Container();
  }

  onTintChange(tint: number) {
    this.tint = tint;
  }

  update(time: number) {
    const intervalsIndices: number[] = this.tracker.findVisibleIndices(time);
    const mainWindow: TimeInterval = [-this.tracker.timeWindow + time, time + this.tracker.timeWindow];
    const pastWindow: TimeInterval = [-this.tracker.timeWindow + time, time];
    const futureWindow: TimeInterval = [time, time + this.tracker.timeWindow];

    this.container.removeChildren();
    const windowDuration = this.tracker.timeWindow;
    const msToPx = (x: number) => positionInTimeline(time, windowDuration, x);

    for (const i of intervalsIndices) {
      const interval = this.tracker.intervals[i];

      {
        const pastIntersection = timeIntervalIntersection(pastWindow, interval);
        if (pastIntersection[0] < pastIntersection[1]) {
          const [sprite] = this.spritePool.allocate("pastTimeInterval" + i);
          // const sprite = new Sprite();
          sprite.width = ((pastIntersection[1] - pastIntersection[0]) / (this.tracker.timeWindow * 2)) * WIDTH;
          sprite.height = KEY_HEIGHT;
          sprite.position.set(msToPx(pastIntersection[0]), 0);
          sprite.alpha = 0.8;
          sprite.tint = this.tint;
          this.container.addChild(sprite);
        }
      }
      {
        const futureIntersection = timeIntervalIntersection(futureWindow, interval);
        if (futureIntersection[0] < futureIntersection[1]) {
          const [sprite] = this.spritePool.allocate("futureTimeInterval" + i);
          // const sprite = new Sprite();
          sprite.width = ((futureIntersection[1] - futureIntersection[0]) / (this.tracker.timeWindow * 2)) * WIDTH;
          sprite.height = KEY_HEIGHT;
          sprite.position.set(msToPx(futureIntersection[0]), 0);
          sprite.alpha = 0.05;
          sprite.tint = this.tint;
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

// [time - duration, time + duration][
function createTimeWindow(time: number, duration: number): TimeInterval {
  return [time - duration, time + duration];
}

function hitObjectWindow(hitObject: MainHitObject): TimeInterval {
  if (isHitCircle(hitObject)) return [hitObject.hitTime, hitObject.hitTime];
  return [hitObject.startTime, hitObject.startTime + hitObject.duration];
}

export class KeyPressOverlay {
  public container: Container;
  private key1: KeyPressOverlayRow;
  private key2: KeyPressOverlayRow;
  private hitObjectContainer: Container;
  private spritePool: TemporaryObjectPool<Sprite>;

  private hitObjects: OsuHitObject[] = [];

  // Determines how much in the past and how much in the future is visible, i.e., the visible window shows
  // `[currentTime - windowDuration, currentTime + windowDuration]`
  private windowDuration: number = defaultTimeWindow;
  private hitObjectTracker: NonIntersectingTimeIntervalsTracker = new NonIntersectingTimeIntervalsTracker([], 0);
  private renderer?: Renderer;
  private timeIntervals: TimeInterval[] = [];

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
    this.key1.onTintChange(DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey1);
    this.key2.onTintChange(DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey2);
    this.hitObjectContainer = new Container();
    this.container.addChild(this.key1.container, this.key2.container, this.hitObjectContainer);
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

      for (let i = 5; i <= 100; i += 5) {
        // Bottom
        {
          const tick = new Sprite(Texture.WHITE);
          tick.width = tickWidth;
          tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
          tick.alpha = tickAlpha;
          tick.position.set(positionInTimeline(0, this.windowDuration, -i), HEIGHT - tick.height);
          this.container.addChild(tick);
        }

        // Top
        {
          const tick = new Sprite(Texture.WHITE);
          tick.width = tickWidth;
          tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
          tick.alpha = tickAlpha;
          tick.position.set(positionInTimeline(0, this.windowDuration, -i), 0);
          this.container.addChild(tick);
        }
      }
    }
    this.spritePool = new TemporaryObjectPool<Sprite>(
      () => new Sprite(Texture.WHITE),
      (g) => {
        // unexpected arrow function
      },
      { initialSize: 50 },
    );
  }

  onWindowDurationChange(windowDuration: number) {
    this.windowDuration = windowDuration;
    this.key1.tracker.timeWindow = windowDuration;
    this.key2.tracker.timeWindow = windowDuration;
    // Need to change where the ticks are drawn as well
  }

  onKeyPressesChange(timeIntervals: TimeIntervals[]) {
    this.key1.tracker.intervals = timeIntervals[0];
    this.key2.tracker.intervals = timeIntervals[1];
  }

  onHitObjectsChange(hitObjects: OsuHitObject[]) {
    this.hitObjects = hitObjects;
    this.timeIntervals = this.hitObjects.map(hitObjectWindow);
    this.hitObjectTracker = new NonIntersectingTimeIntervalsTracker(this.timeIntervals, this.windowDuration);
  }

  onRendererChange(renderer: Renderer) {
    this.renderer = renderer;
  }

  update(currentTime: number) {
    this.key1.update(currentTime);
    this.key2.update(currentTime);

    // Check which objects are visible and draw them accordingly
    const window = createTimeWindow(currentTime, this.windowDuration);
    const indices = this.hitObjectTracker.findVisibleIndices(currentTime);

    if (this.renderer) {
      // const graphics = new Graphics();
    }
    // console.log(`Found ${indices.length} hitobjects to draw!`);
    // Show from back to forth
    this.hitObjectContainer.removeChildren();
    for (let i = indices.length - 1; i >= 0; i--) {
      const hitObject = this.hitObjects[indices[i]];

      const aHeight = HEIGHT * 0.5;
      let sprite;
      if (isHitCircle(hitObject)) {
        [sprite] = this.spritePool.allocate("hitCircle" + indices[i]);
        sprite.width = 5;
        sprite.height = aHeight;

        const x = positionInTimeline(currentTime, this.windowDuration, hitObject.hitTime);
        sprite.position.set(x, (HEIGHT - sprite.height) / 2);
        // console.log(x);
        this.hitObjectContainer.addChild(sprite);
        // this.hitObjectContainer.addChild(area.container);
      } else {
        [sprite] = this.spritePool.allocate("durationBox" + indices[i]);
        const intersection = timeIntervalIntersection(this.timeIntervals[indices[i]], window);
        const duration = intersection[1] - intersection[0];
        sprite.width = (duration / (2 * this.windowDuration)) * WIDTH;
        sprite.height = aHeight;
        const x = positionInTimeline(currentTime, this.windowDuration, intersection[0]);
        sprite.position.set(x, (HEIGHT - sprite.height) / 2);
      }
      sprite.alpha = 0.727;
      this.hitObjectContainer.addChild(sprite);
    }
    this.spritePool.releaseUntouched();
  }
}

@injectable()
export class KeyPressWithNoteSheetPreparer {
  keyPressOverlay: KeyPressOverlay;

  constructor(
    private readonly gameplayClock: GameplayClock,
    private readonly replayManager: ReplayManager,
    private readonly beatmapManager: BeatmapManager,
    private readonly rendererManager: PixiRendererManager,
  ) {
    this.keyPressOverlay = new KeyPressOverlay();

    this.replayManager.mainReplay$.subscribe((replay) => {
      if (replay === null) {
        console.log("Key presses have been reset");
        this.keyPressOverlay.onKeyPressesChange([[], []]);
      } else {
        const clicks = calculateReplayClicks(replay.frames);
        console.log(`Calculated clicks: [${clicks[0].length}, ${clicks[1].length}]`);
        this.keyPressOverlay.onKeyPressesChange(clicks);
      }
    });
    this.beatmapManager.beatmap$.subscribe((beatmap) => {
      this.keyPressOverlay.onHitObjectsChange(beatmap.hitObjects);
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
