import { OsuAction, ReplayFrame } from "./Replay";
import { Position, Vec2 } from "@rewind/osu/math";
import { HitCircle } from "../hitobjects/HitCircle";
import { Slider } from "../hitobjects/Slider";
import { Spinner } from "../hitobjects/Spinner";
import { Beatmap } from "../beatmap/Beatmap";
import { MainHitObjectVerdict } from "./Verdicts";

// Maybe rename this to GamePlay since a replay is a very concrete term for something recorded

// For each circle:

type HitObjectVerdict = MainHitObjectVerdict;

// If the OD or NoteLocking method changes, it must still be recalculated
export enum NoteLockStyle {
  NONE,
  STABLE,
  LAZER,
}

export type NextFrameEvaluatorOptions = {
  // TODO: Maybe say : lazerHitWindowStyle? -> then the hitwindows are increased by +1
  hitWindows: number[];
  noteLockStyle: NoteLockStyle;
};

const sliderProgress = (slider: Slider, time: number) => (time - slider.startTime) / slider.duration;

export const NOT_PRESSING = +727727727;

type PressingSinceTimings = number[];

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

/**
 * Judgment should be as separated as possible from hit events.
 *
 * However, due to a certain mechanics in the game, such as note lock, the
 * hit events are also dependent on the OD.
 */

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

export enum HitCircleMissReason {
  TIME_EXPIRED = "TIME_EXPIRED",
  // There is no HIT_TOO_LATE because TIME_EXPIRED is the corresponding case
  HIT_TOO_EARLY = "HIT_TOO_EARLY",

  // This is only possible in osu!lazer where
  FORCE_MISS_NOTELOCK = "FORCE_MISS_NOTELOCK",
  // If the user had time to press the hitCircle until time 300, but the slider is so short that it ends at 200,
  // then the user actually has a reduced hit window for hitting it.
  SLIDER_FINISHED_FASTER = "SLIDER_FINISHED_FASTER",
}

// Maybe rename those to Judgement ... HitCircleJudgement
export type HitCircleState = {
  // Is the only that has a judgement time not being equal the hit object hitTime/startTime/endTime.
  judgementTime: number;
} & ({ type: MainHitObjectVerdict } | { type: "MISS"; missReason: HitCircleMissReason });

// The reason we don't need to save position like in HitCircleState is that THERE is only one position and that
// is the position of the frame right after the check point time.
export type CheckPointState = {
  hit: boolean;
};

export type SliderBodyState = {
  isTracking: boolean;
};

export type SpinnerState = {
  wholeSpinCount: number;
  // Maybe also current RPM that can be shown
};

// TODO: GameplayState
export interface ReplayState {
  // currentTime might be not really needed, but serves as an "id"
  currentTime: number;
  cursorPosition: Position;
  // Useful infos
  hitCircleState: Map<string, HitCircleState>;
  sliderBodyState: Map<string, SliderBodyState>;
  checkPointState: Map<string, CheckPointState>;
  // A summary of how well the slider was played
  sliderJudgement: Map<string, MainHitObjectVerdict>;
  spinnerState: Map<string, SpinnerState>;

  // TODO: Remove
  currentCombo: number;
  maxCombo: number;

  clickWasUseful: boolean;

  // Stores the ids of the objects that have been judged in the order of judgement.
  // This can be used to easily derive the combo,maxCombo,accuracy,number of 300/100/50/misses, score
  // This is only useful for knowing the order
  judgedObjects: Array<string>;

  // Rest are used for optimizations
  latestHitObjectIndex: number;
  aliveHitCircleIds: Set<string>;
  aliveSliderIds: Set<string>;
  aliveSpinnerIds: Set<string>;

  // For each slider, if it is alive, then there is an entry. The index indicates which checkpoint should be checked next.
  nextCheckPointIndex: Map<string, number>;
  pressingSince: PressingSinceTimings;
}

export function cloneReplayState(replayState: ReplayState): ReplayState {
  const {
    aliveHitCircleIds,
    hitCircleState,
    aliveSliderIds,
    aliveSpinnerIds,
    spinnerState,
    sliderJudgement,
    sliderBodyState,
    checkPointState,
    nextCheckPointIndex,
    clickWasUseful,
    maxCombo,
    currentCombo,
    currentTime,
    cursorPosition,
    latestHitObjectIndex,
    pressingSince,
    judgedObjects,
  } = replayState;
  return {
    hitCircleState: new Map<string, HitCircleState>(hitCircleState),
    aliveHitCircleIds: new Set<string>(aliveHitCircleIds),
    aliveSliderIds: new Set<string>(aliveSliderIds),
    aliveSpinnerIds: new Set<string>(aliveSpinnerIds),
    checkPointState: new Map<string, CheckPointState>(checkPointState),
    currentCombo: currentCombo,
    currentTime: currentTime,
    cursorPosition: cursorPosition,
    latestHitObjectIndex: latestHitObjectIndex,
    judgedObjects: [...judgedObjects],
    clickWasUseful: clickWasUseful,
    maxCombo: maxCombo,
    nextCheckPointIndex: nextCheckPointIndex,
    sliderBodyState: new Map<string, SliderBodyState>(sliderBodyState),
    sliderJudgement: new Map<string, MainHitObjectVerdict>(sliderJudgement),
    spinnerState: new Map<string, SpinnerState>(spinnerState),
    pressingSince: [...pressingSince],
  };
}

// type HitObjectJudgementType = HitObjectVerdict;
// export enum HitObjectJudgementType {
//   Great,
//   Ok,
//   Meh,
//   Miss,
// }

function sliderJudgementBasedOnCheckpoints(totalCheckpoints: number, hitCheckpoints: number): MainHitObjectVerdict {
  if (hitCheckpoints === totalCheckpoints) return "GREAT";
  if (hitCheckpoints === 0) return "MISS";
  if (hitCheckpoints * 2 >= totalCheckpoints) return "OK";
  return "MEH";
}

// Slider is evaluated at endTime (=sliderStart + duration)
// SliderCheckPoint at its hitTime
// Spinner at endTime
// HitCircle at when it was hit / missed (dynamic)
export const defaultReplayState = (): ReplayState => ({
  currentTime: 0,
  cursorPosition: Vec2.Zero,
  hitCircleState: new Map<string, HitCircleState>(),
  sliderBodyState: new Map<string, SliderBodyState>(),
  checkPointState: new Map<string, CheckPointState>(),
  spinnerState: new Map<string, SpinnerState>(),
  sliderJudgement: new Map<string, MainHitObjectVerdict>(),

  // TODO: Move outside
  currentCombo: 0,
  maxCombo: 0,

  clickWasUseful: false,
  // Rest are used for optimizations
  latestHitObjectIndex: 0 as number,
  aliveHitCircleIds: new Set<string>(),
  aliveSliderIds: new Set<string>(),
  aliveSpinnerIds: new Set<string>(),
  // Also used as an optimization
  judgedObjects: [],
  // For each slider, if it is alive, then there is an entry. The index indicates which checkpoint should be checked next.
  nextCheckPointIndex: new Map<string, number>(),
  pressingSince: [NOT_PRESSING, NOT_PRESSING],
});

const HitObjectVerdicts = {
  GREAT: 0,
  OK: 1,
  MEH: 2,
  MISS: 3,
} as const;

// This will be VERY buggy for 2B maps since we make a big assumption that there are no overlaps between the
// different hit objects.
export class NextFrameEvaluator {
  // Not really relevant to be cloned (since can be derived or are just helper data)
  private timeSupposedToClick?: number; // This can be undefined if no circles are alive.
  private nextTimeSupposedToClick?: number; // This can be undefined if no circles are alive.

  private replayState: ReplayState;

  constructor(private readonly beatmap: Beatmap, private readonly settings: NextFrameEvaluatorOptions) {
    this.replayState = defaultReplayState();
  }

  private get currentTime() {
    return this.replayState.currentTime;
  }

  private get cursorPosition() {
    return this.replayState.cursorPosition;
  }

  private get pressingSince() {
    return this.replayState.pressingSince;
  }

  private get judgedObjects() {
    return this.replayState.judgedObjects;
  }

  private get hitObjectsBySpawnTime() {
    return this.beatmap.hitObjects;
  }

  // Checks whether the user has pressed in this frame
  private get hasFreshClickThisFrame(): boolean {
    return this.replayState.pressingSince.includes(this.currentTime);
  }

  private getHitCircle(id: string): HitCircle {
    return this.beatmap.getHitCircle(id);
  }

  private getSlider(id: string): Slider {
    return this.beatmap.getSlider(id);
  }

  /**
   * Out of the alive HitCircles, the earliest startTime is the time the player is supposed to click.
   *
   * This value is used for determining the offset of the unnecessary click (red stripe in error bar) and also for
   * note lock.
   */
  determineTimeSupposedToClick(): void {
    this.timeSupposedToClick = this.earliestHitCircleStartTime(false);

    // Technically speaking those with a time less than the current time can be forcefully missed with
    // the new Lazer notelock mechanic.
    this.nextTimeSupposedToClick = this.earliestHitCircleStartTime(true);
  }

  earliestHitCircleStartTime(onlyConsiderFutureOnes?: boolean): number | undefined {
    let earliest;
    // Remember Slider is synonymous to HitCircleWithSlider
    for (const id of this.replayState.aliveHitCircleIds) {
      const h = this.getHitCircle(id);
      if (onlyConsiderFutureOnes && h.hitTime < this.currentTime) continue; // this one's in the past;
      // TODO: Not sure if those that would expire in this frame (startTime+missHitWindow<=replayTime), should be
      //  considered??
      earliest = Math.min(earliest ?? 1e10, h.hitTime);
    }
    return earliest;
  }

  /**
   * Checks for new hit objects that must be tracked.
   */
  private checkNewAliveHitObjects(): void {
    while (this.replayState.latestHitObjectIndex < this.hitObjectsBySpawnTime.length) {
      const hitObject = this.hitObjectsBySpawnTime[this.replayState.latestHitObjectIndex];
      // We only consider hit objects in the past.
      if (hitObject.spawnTime > this.replayState.currentTime) {
        break;
      }
      if (hitObject instanceof Spinner) {
        this.replayState.aliveSpinnerIds.add(hitObject.id);
      } else if (hitObject instanceof HitCircle) {
        this.replayState.aliveHitCircleIds.add(hitObject.id);
      } else {
        // Slider
        this.replayState.aliveHitCircleIds.add(hitObject.head.id);
        this.replayState.aliveSliderIds.add(hitObject.id);
        this.replayState.nextCheckPointIndex.set(hitObject.id, 0);
      }
      this.replayState.latestHitObjectIndex++;
    }
  }

  private killSpinnerId(id: string) {
    this.replayState.aliveSpinnerIds.delete(id);
  }

  // This is also for SliderHeads
  private finishHitCircle(id: string, state: HitCircleState) {
    this.replayState.hitCircleState.set(id, state);
    this.replayState.aliveHitCircleIds.delete(id);
    this.judgedObjects.push(id);

    // TODO: Remove
    this.judgeHitObject(state.type);
  }

  // Evaluate and cleanup
  private finishSlider(id: string) {
    const slider = this.getSlider(id);

    // Clean up the head if it hasn't been hit
    if (!this.replayState.hitCircleState.has(slider.head.id)) {
      this.finishHitCircle(slider.head.id, {
        judgementTime: slider.endTime,
        type: "MISS",
        missReason: HitCircleMissReason.SLIDER_FINISHED_FASTER,
      });
    }

    // In osu!classic Head is also a "CheckPoint"
    const totalCheckpoints = slider.checkPoints.length + 1;
    let hitCheckpoints = 0;

    if (this.replayState.hitCircleState.get(slider.head.id)?.type !== "MISS") hitCheckpoints++;

    for (const c of slider.checkPoints) {
      hitCheckpoints += this.replayState.checkPointState.get(c.id)?.hit ? 1 : 0;
    }
    const judgement = sliderJudgementBasedOnCheckpoints(totalCheckpoints, hitCheckpoints);
    this.replayState.sliderJudgement.set(id, judgement);

    this.judgedObjects.push(slider.id);
    // TODO: Remove
    this.judgeHitObject(judgement, true);

    this.replayState.aliveSliderIds.delete(id);
    this.replayState.nextCheckPointIndex.delete(id);
    this.replayState.sliderBodyState.delete(id); // not needed anymore
    this.replayState.aliveHitCircleIds.delete(this.getSlider(id).head.id);
  }

  private get hitWindows() {
    return this.settings.hitWindows;
  }
  private hitWindow(verdict: HitObjectVerdict) {
    return this.hitWindows[HitObjectVerdicts[verdict]];
  }

  private isWithinHitWindow(delta: number, judgementType: MainHitObjectVerdict): boolean {
    return Math.abs(delta) <= this.hitWindow(judgementType);
  }

  handleHitCircle(id: string): void {
    const { hitWindows, noteLockStyle } = this.settings;
    const hitCircle = this.getHitCircle(id);
    const currentTime = this.replayState.currentTime;
    const supposedHitTime = hitCircle.hitTime;
    const timeDelta = currentTime - supposedHitTime;

    // If we can't even do a Meh anymore, then judge it as a miss.
    const earliestDeadTime = hitCircle.hitTime + this.hitWindow("MEH") + 1;
    if (earliestDeadTime <= currentTime) {
      // Let's say currentTime from the replay is at 25ms and actually the circle would die anyways at 20ms, so we say that
      // it died at 20ms.
      this.finishHitCircle(id, {
        judgementTime: earliestDeadTime,
        type: "MISS",
        missReason: HitCircleMissReason.TIME_EXPIRED,
      });
      return;
    }
    // From here now we will only handle clicks
    if (!this.hasFreshClickThisFrame) {
      return;
    }

    // It should not be possible to click two hit circles at the same time
    if (this.replayState.clickWasUseful) {
      return;
    }

    // Check if the cursor was inside =>  if it was not inside, then we will do nothing, not even judge it as a miss -
    // this gives the player more chances to click the circle.
    if (Vec2.distance(hitCircle.position, this.cursorPosition) > hitCircle.radius) {
      return;
    }

    // Notelock policy

    let noteLocked = false;

    // This would be worst since players can just click in random order.
    const noNoteLock = () => {
      return false;
    };

    // If there is one circle that appears earlier and hasn't been judged => lock
    // we do "<" because hitCircles appearing at the same time can then be simultaneously hit.
    const osuStableNoteLock = () => {
      // can't be undefined in this case
      return (this.timeSupposedToClick as number) < hitCircle.hitTime;
    };

    // If there is no note, this note will note be locked
    const osuLazerNoteLock = () => {
      if (this.nextTimeSupposedToClick === undefined) return false;
      return this.nextTimeSupposedToClick < hitCircle.hitTime;
    };

    if (noteLockStyle === NoteLockStyle.NONE) noteLocked = noNoteLock();
    if (noteLockStyle === NoteLockStyle.STABLE) noteLocked = osuStableNoteLock();
    if (noteLockStyle === NoteLockStyle.LAZER) noteLocked = osuLazerNoteLock();

    if (noteLocked) {
      // I think maybe there is a shake, UNLESS click was useful obviously (happens at stacked notes)
      return;
    }

    const jtypes = ["GREAT", "OK", "MEH"] as HitObjectVerdict[];
    for (let i = 0; i < jtypes.length; i++) {
      // SUCCESS the player has hit the circle in terms of space and time!
      if (this.isWithinHitWindow(timeDelta, jtypes[i])) {
        this.finishHitCircle(id, {
          judgementTime: this.currentTime,
          type: jtypes[i],
        });
        this.replayState.clickWasUseful = true;
        // TODO: Force other notes to miss in Lazer note lock style
        return;
      }
    }
    // Technically speaking this can only be too early, since the too late case would be caught above.
    if (this.isWithinHitWindow(timeDelta, "MISS")) {
      if (timeDelta > 0) console.error("? How can HitCircleMiss hit be late");
      this.finishHitCircle(id, {
        judgementTime: this.currentTime,
        type: "MISS",
        missReason: HitCircleMissReason.HIT_TOO_EARLY,
      });

      return;
    }

    // Now we actually clicked it between spawn time and the early miss hit window.
    // -> We would normally shake this circle
  }

  private handleHitCircles(): void {
    // First, we will do changes on this.aliveHitObjectsIdx (removing) so we need to create a copy
    // Also the iteration order should be by start time
    const hitCircleIndices = Array.from(this.replayState.aliveHitCircleIds.values());
    hitCircleIndices.sort((i, j) => this.getHitCircle(i).hitTime - this.getHitCircle(j).hitTime);
    for (const id of hitCircleIndices) {
      this.handleHitCircle(id);
    }
  }

  private headHitTime(headId: string): number | undefined {
    const j = this.replayState.hitCircleState.get(headId);
    if (!j || j.type === "MISS") return undefined;
    return j.judgementTime;
  }

  private updateSliderBodyTracking(): void {
    // For every alive slider (even in non 2B case there might multiple alive)
    for (const id of this.replayState.aliveSliderIds) {
      const slider = this.getSlider(id);

      const headHitTime: number | undefined = this.headHitTime(slider.head.id);
      const wasTracking: boolean = this.replayState.sliderBodyState.get(id)?.isTracking ?? false;
      // If he just released at time here, then assume that
      // Release time is always registered btw
      // TODO
      const isTracking = determineTracking(
        wasTracking,
        slider,
        this.cursorPosition, //  TODO: tbh interpolate
        this.currentTime, // TODO:
        this.pressingSince,
        headHitTime,
      );
      this.replayState.sliderBodyState.set(id, { isTracking });
    }
  }

  private handleSliderJudgment(): void {
    // Some might be killed in the process ...
    const sliderIdsCopy = [...this.replayState.aliveSliderIds];
    for (const id of sliderIdsCopy) {
      const slider = this.getSlider(id);

      if (slider.endTime <= this.currentTime) {
        this.finishSlider(slider.id);
      }
    }
  }

  private comboChange(hit: boolean) {
    if (hit) {
      this.replayState.currentCombo++;
      this.replayState.maxCombo = Math.max(this.replayState.maxCombo, this.replayState.currentCombo);
    } else {
      this.replayState.currentCombo = 0;
    }
  }

  private judgeNonLastCheckpoint(hit: boolean) {
    // LargeTickHit -> affects combo, numeric result: 30
    this.comboChange(hit);
    // TODO: Add numeric result to score
  }

  private judgeLastTick(hit: boolean) {
    // Only increases, does not set to 0
    if (hit) {
      this.comboChange(true);
    }
    // TODO: Add numeric result to score depending on hit or not
  }

  private judgeHitObject(type: MainHitObjectVerdict, isSlider?: boolean) {
    // Sliders don't get combo
    if (!isSlider) this.comboChange(type !== "MISS");
    // TODO: Add numeric result to score
  }

  private handleSliderCheckPoints(): void {
    // Now we check for slider checkpoints
    // Following only slow, if 2B map and lots of sliders at the same time, so don't care.

    // TODO: Is there ever a case where two checkpoints of the same slider have the same time?

    // Find the earliest checkpoint that needs to be checked
    while (true) {
      let sliderIdOfEarliest = undefined,
        earliestTime = 1e18;
      for (const [sliderId, checkPointIndex] of this.replayState.nextCheckPointIndex) {
        const slider = this.getSlider(sliderId);
        const checkPoint = slider.checkPoints[checkPointIndex];
        if (checkPoint.hitTime < this.currentTime && checkPoint.hitTime < earliestTime) {
          sliderIdOfEarliest = sliderId;
          earliestTime = checkPoint.hitTime;
        }
      }
      if (sliderIdOfEarliest === undefined) {
        break;
      }
      const slider = this.getSlider(sliderIdOfEarliest);
      const index = this.replayState.nextCheckPointIndex.get(sliderIdOfEarliest) as number;
      const checkPoint = slider.checkPoints[index];

      // TODO: This needs some kind of interpolation
      const hit = this.replayState.sliderBodyState.get(slider.id)?.isTracking ?? false;
      this.replayState.checkPointState.set(checkPoint.id, { hit });

      // TODO: Remove
      if (checkPoint.type === "LAST_LEGACY_TICK") {
        this.judgeLastTick(hit);
      } else {
        this.judgeNonLastCheckpoint(hit);
      }
      this.judgedObjects.push(checkPoint.id);

      if (index + 1 < slider.checkPoints.length) {
        this.replayState.nextCheckPointIndex.set(slider.id, index + 1);
      } else {
        // Doesn't affect combo
        this.replayState.nextCheckPointIndex.delete(slider.id);
      }
    }
  }

  // TODO: More sophisticated
  private handleSpinners(): void {
    // If 2B, there should only be one
    const spinnerIds = this.replayState.aliveSpinnerIds.values();
    for (const id of spinnerIds) {
      const spinner = this.beatmap.getSpinner(id);
      if (spinner.endTime < this.currentTime) {
        this.replayState.aliveSpinnerIds.delete(spinner.id);
        this.replayState.judgedObjects.push(id);
      }
    }
  }

  evaluateNextFrameMutated(replayStateToChange: ReplayState, frame: ReplayFrame): void {
    this.replayState = replayStateToChange;
    this.replayState.currentTime = frame.time;
    this.replayState.cursorPosition = frame.position;
    this.replayState.clickWasUseful = false;

    this.replayState.pressingSince = newPressingSince(this.replayState.pressingSince, frame.actions, frame.time);
    this.checkNewAliveHitObjects();
    this.determineTimeSupposedToClick();

    this.handleHitCircles();
    this.handleSliderJudgment();
    // We first need to check the check points before updating if the slider got released at .currentTime
    this.handleSliderCheckPoints();
    this.updateSliderBodyTracking();

    this.handleSpinners();
  }
}
