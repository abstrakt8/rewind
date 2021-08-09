import {
  Beatmap,
  defaultGameState,
  GameState,
  HitCircle,
  HitCircleVerdict,
  isHitCircle,
  isSlider,
  MainHitObjectVerdict,
  NOT_PRESSING,
  OsuAction,
  PressingSinceTimings,
  ReplayFrame,
  Slider,
} from "@rewind/osu/core";

import { hitWindowsForOD, Position, Vec2 } from "@rewind/osu/math";

/**
 * In the real osu game, the slider body will be evaluated at every game tick (?), which is something we can not do.
 *
 * The slider body tracking is only evaluated at important points:
 * * check points
 * * real frame times
 * Usually the delta between two frame times should be about ~16ms (~60FPS).
 * Occasionally there are outliers, which happened to me at testing (something like >40ms).
 *
 * Technically speaking
 */

/**
 *  Evaluates the next game state based on the current one and the next frame.
 *
 *  Let the times of the frames be t[1...n]. osu! stores about 60FPS, this means
 *  that in between t[i] and t[i+1] there is no precise information available, which might be problematic for slider checkpoint evaluations.
 *
 * So the following assumption is made for t[i] < t < t[i+1]:
 *  - If the player is still holding a click at t[i], then it's also at time t.
 *  - The position of the cursor at time t is (linearly) interpolated between t[i] and t[i+1].
 *
 */

type Event = {
  time: number;
  hitObjectId: string;
  type:
    | "HIT_CIRCLE_SPAWN"
    | "HIT_CIRCLE_FORCE_KILL"
    | "SLIDER_START"
    | "SLIDER_END"
    | "SPINNER_START"
    | "SPINNER_END"
    | "SLIDER_CHECK_POINT";
};

function generateEvents(beatmap: Beatmap, hitWindows: number[]): Event[] {
  const events: Event[] = [];
  const mehHitWindow = hitWindows[2];

  const pushHitCircleEvents = (h: HitCircle) => {
    events.push({ time: h.hitTime - h.approachDuration, hitObjectId: h.id, type: "HIT_CIRCLE_SPAWN" });
    events.push({ time: h.hitTime + mehHitWindow + 1, hitObjectId: h.id, type: "HIT_CIRCLE_FORCE_KILL" });
  };

  for (const h of beatmap.hitObjects) {
    if (isHitCircle(h)) {
      pushHitCircleEvents(h);
    } else if (isSlider(h)) {
      pushHitCircleEvents(h.head);
      events.push({ time: h.startTime, hitObjectId: h.id, type: "SLIDER_START" });
      events.push({ time: h.endTime, hitObjectId: h.id, type: "SLIDER_END" });
      h.checkPoints.forEach((c) => {
        events.push({ time: c.hitTime, hitObjectId: c.id, type: "SLIDER_CHECK_POINT" });
      });
    } else {
      events.push({ time: h.startTime, hitObjectId: h.id, type: "SPINNER_START" });
      events.push({ time: h.endTime, hitObjectId: h.id, type: "SPINNER_END" });
    }
  }

  // TODO: What if 2B maps?
  events.sort((a, b) => a.time - b.time);

  return events;
}

export type NoteLockStyle = "NONE" | "STABLE" | "LAZER";
export type HitWindowStyle = "OSU_STABLE" | "OSU_LAZER";

export type GameStateEvaluatorOptions = {
  hitWindowStyle: HitWindowStyle;
  noteLockStyle: NoteLockStyle;
};

const defaultOptions: GameStateEvaluatorOptions = {
  noteLockStyle: "STABLE",
  hitWindowStyle: "OSU_STABLE",
};

const HitObjectVerdicts = {
  GREAT: 0,
  OK: 1,
  MEH: 2,
  MISS: 3,
} as const;

function isWithinHitWindow(hitWindow: number[], delta: number, verdict: MainHitObjectVerdict): boolean {
  return Math.abs(delta) <= hitWindow[HitObjectVerdicts[verdict]];
}

export class GameStateEvaluator {
  private readonly events: Event[];
  private gameState: GameState = defaultGameState();
  private frame: ReplayFrame = { time: 0, position: { x: 0, y: 0 }, actions: [] };
  private options: GameStateEvaluatorOptions;
  private hitWindows: number[];

  constructor(private readonly beatmap: Beatmap, options?: GameStateEvaluatorOptions) {
    this.options = Object.assign({ ...defaultOptions }, options);
    this.hitWindows = hitWindowsForOD(
      beatmap.difficulty.overallDifficulty,
      this.options.hitWindowStyle === "OSU_LAZER",
    );
    this.events = generateEvents(beatmap, this.hitWindows);
  }

  judgeHitCircle(id: string, verdict: HitCircleVerdict) {
    this.gameState.hitCircleVerdict[id] = verdict;
    this.gameState.aliveHitCircleIds.delete(id);
    this.gameState.judgedObjects.push(id);
  }

  handleHitCircleSpawn(time: number, hitCircleId: string) {
    this.gameState.aliveHitCircleIds.add(hitCircleId);
  }

  handleHitCircleForceKill(time: number, hitCircleId: string) {
    // Already dead? The shinigami will just leave...
    if (!this.gameState.aliveHitCircleIds.has(hitCircleId)) {
      return;
    }
    // Otherwise we force kill for not being hit by the player ...
    const verdict: HitCircleVerdict = { judgementTime: time, type: "MISS", missReason: "TIME_EXPIRED" };
    this.judgeHitCircle(hitCircleId, verdict);
  }

  handleSliderStart(time: number, sliderId: string) {
    this.gameState.aliveSliderIds.add(sliderId);
  }

  handleSliderEnding(time: number, sliderId: string) {
    const slider = this.beatmap.getSlider(sliderId);

    const headVerdict = this.gameState.hitCircleVerdict[slider.head.id];
    // Clean up the head if it hasn't been interacted with the player in any way.
    if (headVerdict === undefined) {
      this.judgeHitCircle(slider.head.id, {
        judgementTime: slider.endTime,
        type: "MISS",
        missReason: "SLIDER_FINISHED_FASTER",
      });
    }

    // Now count the hit checkpoints and get the verdict
    const totalCheckpoints = slider.checkPoints.length + 1;
    let hitCheckpoints = 0;
    if (!(headVerdict === undefined || headVerdict.type === "MISS")) hitCheckpoints++;
    for (const c of slider.checkPoints) {
      hitCheckpoints += this.gameState.checkPointVerdict[c.id]?.hit ? 1 : 0;
    }
    this.gameState.sliderVerdict[slider.id] = sliderVerdictBasedOnCheckpoints(totalCheckpoints, hitCheckpoints);
    this.gameState.judgedObjects.push(slider.id);

    // The head should not be alive
    this.gameState.aliveSliderIds.delete(sliderId);
    this.gameState.sliderBodyState.delete(sliderId);
  }

  predictedCursorPositionAt(time: number): Position {
    const previousTime = this.gameState.currentTime;
    const nextTime = this.frame.time;
    const previousPosition = this.gameState.cursorPosition;
    const nextPosition = this.frame.position;

    if (previousTime === nextTime) return previousPosition;

    const f = (time - previousTime) / (nextTime - previousTime);
    return Vec2.interpolate(previousPosition, nextPosition, f);
  }

  handleSliderCheckPoint(time: number, id: string) {
    const cursorPosition = this.predictedCursorPositionAt(time);
    const checkPoint = this.beatmap.getSliderCheckPoint(id);
    this.updateSliderBodyTracking(time, cursorPosition, this.gameState.pressingSince);
    const sliderId = checkPoint.slider.id;
    const state = this.gameState.sliderBodyState.get(sliderId);
    if (state === undefined) {
      throw Error("Somehow the slider body has no state while there is a checkpoint alive.");
    }
    this.gameState.checkPointVerdict[id] = { hit: state.isTracking };
    this.gameState.judgedObjects.push(id);
  }

  handleSpinnerStart(id: string) {
    this.gameState.aliveSpinnerIds.add(id);
  }

  handleSpinnerEnd(id: string) {
    this.gameState.aliveSpinnerIds.delete(id);
    this.gameState.judgedObjects.push(id);
  }

  handleEvent(event: Event) {
    const { hitObjectId, time, type } = event;
    switch (type) {
      case "HIT_CIRCLE_SPAWN":
        this.handleHitCircleSpawn(time, hitObjectId);
        break;
      case "HIT_CIRCLE_FORCE_KILL":
        this.handleHitCircleForceKill(time, hitObjectId);
        break;
      case "SLIDER_START":
        this.handleSliderStart(time, hitObjectId);
        break;
      case "SLIDER_END":
        this.handleSliderEnding(time, hitObjectId);
        break;
      case "SLIDER_CHECK_POINT":
        this.handleSliderCheckPoint(time, hitObjectId);
        break;
      case "SPINNER_START":
        this.handleSpinnerStart(hitObjectId);
        break;
      case "SPINNER_END":
        this.handleSpinnerEnd(hitObjectId);
        break;
    }
  }

  handleAliveHitCircles() {
    // There is only action if there is also a click in this frame ...
    if (!this.hasFreshClickThisFrame) {
      return;
    }
    const { noteLockStyle } = this.options;
    const currentTime = this.gameState.currentTime;
    let noteLocked = false;

    // JavaScript `Set` maintains its elements in insertion order so the early ones
    // we iterate on are also the ones that are supposed to be hit first ...
    // We copy because the values into an array because we might delete them ...
    const hitCircleIds = Array.from(this.gameState.aliveHitCircleIds.values());

    for (let i = 0; i < hitCircleIds.length; i++) {
      const id = hitCircleIds[i];
      const hitCircle = this.beatmap.getHitCircle(id);
      const cursorInside = Vec2.distance(hitCircle.position, this.gameState.cursorPosition) <= hitCircle.radius;

      if (!cursorInside) {
        // We put a lock on the other circles because the first alive HitCircle is the only circle we can interact with.
        if (noteLockStyle === "STABLE") {
          noteLocked = true;
        }
        // It's a bit fairer because this allows us to force miss notes that are in the past.
        if (noteLockStyle === "LAZER" && currentTime <= hitCircle.hitTime) {
          noteLocked = true;
        }
        continue;
      }

      // If we got note locked, we want to set an animation then ignore the other hit circles
      if (noteLocked) {
        // TODO: Set state of `id` to be noteLocked at the current time (this allows us to show an "shaking" animation)
        break;
      }

      const delta = currentTime - hitCircle.hitTime;
      let judged = false;
      for (const verdict of ["GREAT", "OK", "MEH"] as const) {
        if (isWithinHitWindow(this.hitWindows, delta, verdict)) {
          this.judgeHitCircle(hitCircle.id, { judgementTime: currentTime, type: verdict });
          judged = true;
          break;
        }
      }

      // TODO: Force miss other notes less than i
      if (judged) break;

      // Technically speaking this can only be too early, since the too late case would be caught above.
      if (isWithinHitWindow(this.hitWindows, delta, "MISS")) {
        this.judgeHitCircle(hitCircle.id, { judgementTime: currentTime, type: "MISS", missReason: "HIT_TOO_EARLY" });
        judged = true;
      }

      // TODO: Do we force miss other notes as well?
      if (judged) break;
    }
  }

  private get hasFreshClickThisFrame(): boolean {
    return this.gameState.pressingSince.includes(this.gameState.currentTime);
  }

  private headHitTime(headId: string): number | undefined {
    const verdict = this.gameState.hitCircleVerdict[headId];
    if (!verdict || verdict.type === "MISS") return undefined;
    return verdict.judgementTime;
  }

  private updateSliderBodyTracking(time: number, cursorPosition: Position, pressingSince: PressingSinceTimings): void {
    // For every alive slider (even in non 2B case there might multiple alive)
    for (const id of this.gameState.aliveSliderIds) {
      const slider = this.beatmap.getSlider(id);

      const headHitTime: number | undefined = this.headHitTime(slider.head.id);
      const wasTracking: boolean = this.gameState.sliderBodyState.get(id)?.isTracking ?? false;
      const isTracking = determineTracking(wasTracking, slider, cursorPosition, time, pressingSince, headHitTime);
      this.gameState.sliderBodyState.set(id, { isTracking });
    }
  }

  evaluate(gameState: GameState, frame: ReplayFrame) {
    this.gameState = gameState;
    this.frame = frame;

    // 1. Deal with hit objects that are only affected with movement (sliders, spinners)
    while (gameState.eventIndex < this.events.length) {
      const event = this.events[gameState.eventIndex];
      // We haven't reached the time yet
      if (frame.time < event.time) {
        break;
      }
      gameState.eventIndex += 1;
      this.handleEvent(event);
    }

    // 2. Now consider things that get affected by releasing / clicking at this particular time.
    this.gameState.cursorPosition = frame.position;
    this.gameState.currentTime = frame.time;
    this.gameState.pressingSince = newPressingSince(this.gameState.pressingSince, frame.actions, frame.time);
    this.gameState.clickWasUseful = false;

    this.handleAliveHitCircles();
    this.updateSliderBodyTracking(frame.time, frame.position, this.gameState.pressingSince);
  }
}

const sliderProgress = (slider: Slider, time: number) => (time - slider.startTime) / slider.duration;

/**
 * SliderTracking is described in a complicated way in osu!lazer, but it can be boiled down to:
 *
 * * A key must be pressed (?)
 * * Slider tracking is only done between slider.startTime (inclusively) and slider.endTime
 * (exclusively).
 * * The follow circle is scaled up to 2.4 if tracking, and down to 1.0 if not tracking, the cursor should be
 * in the follow circle.
 * * Additionally there are two states of a slider:
 *  - Either the header was not hit, then we can accept any key for slider tracking.
 *
 *  - If the head was hit at `t`, then we can only restrict the keys to "fresh" clicks, which means clicks not
 * before t.
 *
 * Note that the state can be 1. at first and then transition to 2.
 *
 * In osu!lazer the tracking follows the visual tracking:
 * https://discord.com/channels/188630481301012481/188630652340404224/865648740810883112
 * https://github.com/ppy/osu/blob/6cec1145e3510eb27c6fbeb0f93967d2d872e600/osu.Game.Rulesets.Osu/Mods/OsuModClassic.cs#L61
 * The slider ball actually gradually scales to 2.4 (duration: 300ms, method: Easing.OutQuint) which means that at the beginning
 * the cursor has less leeway than after 300ms, while in osu!stable you instantly have the maximum leeway.
 * In osu!lazer it's actually a little bit harder than osu!stable.
 */

function determineTracking(
  previouslyTracking: boolean,
  slider: Slider,
  cursorPosition: Position,
  time: number,
  pressingSince: PressingSinceTimings,
  headHitTime?: number,
): boolean {
  const keyIsBeingPressed = pressingSince.findIndex((x) => x !== NOT_PRESSING) >= 0;
  // Zeroth condition
  if (!keyIsBeingPressed) return false;

  // First condition
  if (time < slider.startTime || slider.endTime <= time) return false;

  // Second condition
  const progress = sliderProgress(slider, time);
  const followCircleRadius = (previouslyTracking ? 2.4 : 1.0) * slider.radius;
  const distanceCursorToBall = Vec2.distance(slider.ballPositionAt(progress), cursorPosition);
  if (distanceCursorToBall > followCircleRadius) return false;

  // Now last condition
  // State 1
  if (headHitTime === undefined) return true; // Since any key is ok
  // For the click that was done at t=headHitTime: t >= headHitTime is true.
  // In the other case, we require a fresh click
  // State 2 (requiring a fresh click)
  return pressingSince.findIndex((x) => x >= headHitTime) >= 0;
}

function sliderVerdictBasedOnCheckpoints(totalCheckpoints: number, hitCheckpoints: number): MainHitObjectVerdict {
  if (hitCheckpoints === totalCheckpoints) return "GREAT";
  if (hitCheckpoints === 0) return "MISS";
  if (hitCheckpoints * 2 >= totalCheckpoints) return "OK";
  return "MEH";
}

// Maybe hitObjects should be flattened out (nested pulled out)
// The mods should be applied to those them ...
const actionsToBooleans = (osuActions: OsuAction[]) => [
  osuActions.includes(OsuAction.leftButton),
  osuActions.includes(OsuAction.rightButton),
];

export const newPressingSince = (pressingSince: PressingSinceTimings, osuActions: OsuAction[], time: number) => {
  const pressed = actionsToBooleans(osuActions);
  const newPressingSince = [...pressingSince];
  for (let i = 0; i < newPressingSince.length; i++) {
    if (pressed[i]) {
      newPressingSince[i] = Math.min(newPressingSince[i], time);
    } else {
      newPressingSince[i] = NOT_PRESSING;
    }
  }
  return newPressingSince;
};
