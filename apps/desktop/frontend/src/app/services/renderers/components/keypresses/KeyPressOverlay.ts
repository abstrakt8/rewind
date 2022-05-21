import { TemporaryObjectPool } from "../../../../utils/pooling/TemporaryObjectPool";
import { Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import {
  calculateReplayClicks,
  isHitCircle,
  MainHitObject,
  OsuHitObject,
  TimeInterval,
  TimeIntervals,
} from "@osujs/core";
import { injectable } from "inversify";
import { ReplayManager } from "../../../manager/ReplayManager";
import { GameplayClock } from "../../../common/game/GameplayClock";
import { BeatmapManager } from "../../../manager/BeatmapManager";
import { clamp } from "@osujs/math";
import { DEFAULT_ANALYSIS_CURSOR_SETTINGS } from "../../../analysis/analysis-cursor";

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
const KEY_HEIGHT = 35;

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
          sprite.alpha = 0.1;
          sprite.tint = this.tint;
          this.container.addChild(sprite);
        }
      }
    }
    this.spritePool.releaseUntouched();
  }
}

// As a reusable component
// interface KeyPressOverlaySettings {}

const MIN_WINDOW_DURATION = 100;
const MAX_WINDOW_DURATION = 2000;
const DEFAULT_WINDOW_DURATION = 500;
const DEFAULT_DEBUG_RECTANGLE_ALPHA = 0.5;

// [time - duration, time + duration][
function createTimeWindow(time: number, duration: number): TimeInterval {
  return [time - duration, time + duration];
}

function hitObjectWindow(hitObject: MainHitObject): TimeInterval {
  if (isHitCircle(hitObject)) return [hitObject.hitTime, hitObject.hitTime];
  return [hitObject.startTime, hitObject.startTime + hitObject.duration];
}

function preventBrowserShortcuts(e: KeyboardEvent) {
  if (e.key === "Alt") {
    // console.log("Prevented Alt");
    e.preventDefault();
  }
}

export class KeyPressOverlay {
  public container: Container;
  private key1: KeyPressOverlayRow;
  private key2: KeyPressOverlayRow;
  private hitObjectContainer: Container;
  private rulerTicksContainer: Container;
  private spritePool: TemporaryObjectPool<Sprite>;

  private hitObjects: OsuHitObject[] = [];

  // Determines how much in the past and how much in the future is visible, i.e., the visible window shows
  // `[currentTime - windowDuration, currentTime + windowDuration]`
  private windowDuration: number = DEFAULT_WINDOW_DURATION;
  private hitObjectTracker: NonIntersectingTimeIntervalsTracker = new NonIntersectingTimeIntervalsTracker([], 0);
  private timeIntervals: TimeInterval[] = [];

  // Currently the rectangle is still used for debugging purposes ... will be replaced by something fancier in the
  // future.
  private debugRectangle = new Graphics();
  private hovered = false;

  constructor(private readonly gameplayClock: GameplayClock) {
    this.container = new Container();
    this.container.width = WIDTH;
    this.container.height = HEIGHT;

    // Just for debugging
    {
      this.debugRectangle.lineStyle(2, 0xffffff);
      this.debugRectangle.drawRect(0, 0, WIDTH, HEIGHT);
      this.debugRectangle.alpha = DEFAULT_DEBUG_RECTANGLE_ALPHA;
      this.container.addChild(this.debugRectangle);
    }

    this.key1 = new KeyPressOverlayRow([], DEFAULT_WINDOW_DURATION);
    this.key2 = new KeyPressOverlayRow([], DEFAULT_WINDOW_DURATION);
    this.key1.onTintChange(DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey1);
    this.key2.onTintChange(DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey2);
    this.hitObjectContainer = new Container();
    this.rulerTicksContainer = new Container();
    this.container.addChild(
      this.key1.container,
      this.key2.container,
      this.hitObjectContainer,
      this.rulerTicksContainer,
    );
    // const margin = 10;
    this.key1.container.position.set(0, HEIGHT / 2 - KEY_HEIGHT);
    this.key2.container.position.set(0, HEIGHT / 2);

    {
      const middleLine = new Sprite(Texture.WHITE);
      middleLine.width = 1;
      middleLine.height = HEIGHT;
      middleLine.alpha = 0.4;
      middleLine.position.set(WIDTH / 2, 0);
      this.container.addChild(middleLine);
    }

    this.setupRulerTicks();

    this.spritePool = new TemporaryObjectPool<Sprite>(
      () => new Sprite(Texture.WHITE),
      (g) => {
        // unexpected arrow function
      },
      { initialSize: 50 },
    );

    // https://jsfiddle.net/funkybjorn/ccqz6n8a/3/
    this.container.interactive = true;
    // this.container.buttonMode = true;
    this.container.on("mouseover", this.onMouseOver.bind(this));
    this.container.on("mouseout", this.onMouseOut.bind(this));
    // We need this hitArea otherwise we can only zoom when hovering over a child, which is awkward
    this.container.hitArea = new Rectangle(0, 0, WIDTH, HEIGHT);

    window.addEventListener("wheel", this.onWheelEvent.bind(this));
  }

  onWheelEvent(ev: WheelEvent) {
    if (!this.hovered) {
      return;
    }
    // It's something like 100 or 200
    // console.log("wheel deltaY=", ev.deltaY);

    // When holding the alt key, we can zoom
    if (ev.altKey) {
      const scaling = 0.5;
      const newWindowDuration = clamp(
        ev.deltaY * scaling + this.windowDuration,
        MIN_WINDOW_DURATION,
        MAX_WINDOW_DURATION,
      );
      this.onWindowDurationChange(newWindowDuration);
    } else {
      // Currently this is a very dumb way of scrolling
      // In the future we should make the scrolling work like in the editor where it snaps to the note / beat snap
      // divisor.
      const scaling = 0.1;
      const newTime = clamp(
        ev.deltaY * scaling + this.gameplayClock.timeElapsedInMs,
        0,
        this.gameplayClock.durationInMs,
      );
      this.gameplayClock.seekTo(newTime);
    }
  }

  onMouseOver() {
    this.hovered = true;
    this.debugRectangle.alpha = 1;

    // Otherwise the browser menu will be opened, which is pretty annoying
    window.addEventListener("keydown", preventBrowserShortcuts);
  }

  onMouseOut() {
    this.hovered = false;
    this.debugRectangle.alpha = DEFAULT_DEBUG_RECTANGLE_ALPHA;

    window.removeEventListener("keydown", preventBrowserShortcuts);
  }

  onWindowDurationChange(windowDuration: number) {
    this.windowDuration = windowDuration;
    this.key1.tracker.timeWindow = windowDuration;
    this.key2.tracker.timeWindow = windowDuration;
    this.hitObjectTracker.timeWindow = windowDuration;
    this.setupRulerTicks();
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

  setupRulerTicks() {
    const tickHeight = 5,
      tickWidth = 1;
    const tickAlpha = 0.2;

    this.rulerTicksContainer.removeChildren();
    for (let i = 5; i <= 100; i += 5) {
      // Bottom
      {
        const tick = new Sprite(Texture.WHITE);
        tick.width = tickWidth;
        tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
        tick.alpha = tickAlpha;
        tick.position.set(positionInTimeline(0, this.windowDuration, -i), HEIGHT - tick.height);
        this.rulerTicksContainer.addChild(tick);
      }

      // Top
      {
        const tick = new Sprite(Texture.WHITE);
        tick.width = tickWidth;
        tick.height = i % 25 === 0 ? tickHeight * 2 : tickHeight;
        tick.alpha = tickAlpha;
        tick.position.set(positionInTimeline(0, this.windowDuration, -i), 0);
        this.rulerTicksContainer.addChild(tick);
      }
    }
  }

  update(currentTime: number) {
    this.key1.update(currentTime);
    this.key2.update(currentTime);

    // Check which objects are visible and draw them accordingly
    const window = createTimeWindow(currentTime, this.windowDuration);
    const indices = this.hitObjectTracker.findVisibleIndices(currentTime);

    // console.log(`Found ${indices.length} hitobjects to draw!`);
    // Show from back to forth
    this.hitObjectContainer.removeChildren();
    for (let i = indices.length - 1; i >= 0; i--) {
      const hitObject = this.hitObjects[indices[i]];

      // He
      const aHeight = HEIGHT * 0.35;
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
  ) {
    this.keyPressOverlay = new KeyPressOverlay(gameplayClock);

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
