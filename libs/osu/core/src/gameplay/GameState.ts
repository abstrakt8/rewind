import { Position, Vec2 } from "@rewind/osu/math";
import { MainHitObjectVerdict } from "./Verdicts";

export const NOT_PRESSING = +727727727;

export type PressingSinceTimings = number[];

const HitCircleMissReasons = [
  // When the time has expired and the circle got force killed.
  "TIME_EXPIRED",
  // There is no HIT_TOO_LATE because TIME_EXPIRED would occur earlier.
  "HIT_TOO_EARLY",
  // This is only possible in osu!lazer where clicking a later circle can cause this circle to be force missed.
  "FORCE_MISS_NOTELOCK",
  // If the user had time to press the hitCircle until time 300, but the slider is so short that it ends at 200,
  // then the user actually has a reduced hit window for hitting it.
  "SLIDER_FINISHED_FASTER",
] as const;

export type HitCircleMissReason = typeof HitCircleMissReasons[number];

export type HitCircleVerdict = {
  // Is the only that has a judgement time not being equal the hit object hitTime/startTime/endTime.
  judgementTime: number;
} & ({ type: "GREAT" | "MEH" | "OK" } | { type: "MISS"; missReason: HitCircleMissReason });

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

export interface GameState {
  // currentTime might be not really needed, but serves as an "id"
  currentTime: number;
  cursorPosition: Position;

  // Keeps track of where we are in the events list (as an optimization).
  eventIndex: number;

  // The verdicts are a summary of how well these objects were played
  hitCircleVerdict: Record<string, HitCircleVerdict>;
  checkPointVerdict: Record<string, CheckPointState>;
  sliderVerdict: Record<string, MainHitObjectVerdict>;
  // spinnerVerdict ..

  spinnerState: Map<string, SpinnerState>;
  sliderBodyState: Map<string, SliderBodyState>;

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

  pressingSince: PressingSinceTimings;
}

export const defaultGameState = (): GameState => ({
  eventIndex: 0,
  currentTime: 0,
  cursorPosition: Vec2.Zero,
  hitCircleVerdict: {},
  sliderBodyState: new Map<string, SliderBodyState>(),
  checkPointVerdict: {},
  spinnerState: new Map<string, SpinnerState>(),
  sliderVerdict: {},

  clickWasUseful: false,
  // Rest are used for optimizations
  latestHitObjectIndex: 0 as number,
  aliveHitCircleIds: new Set<string>(),
  aliveSliderIds: new Set<string>(),
  aliveSpinnerIds: new Set<string>(),
  // Also used as an optimization
  judgedObjects: [],
  pressingSince: [NOT_PRESSING, NOT_PRESSING],
});

export function cloneGameState(replayState: GameState): GameState {
  const {
    aliveHitCircleIds,
    aliveSliderIds,
    aliveSpinnerIds,
    spinnerState,
    sliderBodyState,
    checkPointVerdict,
    hitCircleVerdict,
    sliderVerdict,
    eventIndex,
    clickWasUseful,
    currentTime,
    cursorPosition,
    latestHitObjectIndex,
    pressingSince,
    judgedObjects,
  } = replayState;
  return {
    eventIndex: eventIndex,
    aliveHitCircleIds: new Set<string>(aliveHitCircleIds),
    aliveSliderIds: new Set<string>(aliveSliderIds),
    aliveSpinnerIds: new Set<string>(aliveSpinnerIds),
    hitCircleVerdict: { ...hitCircleVerdict },
    sliderVerdict: { ...sliderVerdict },
    checkPointVerdict: { ...checkPointVerdict },
    currentTime: currentTime,
    cursorPosition: cursorPosition,
    latestHitObjectIndex: latestHitObjectIndex,
    judgedObjects: [...judgedObjects],
    clickWasUseful: clickWasUseful,
    sliderBodyState: new Map<string, SliderBodyState>(sliderBodyState),
    spinnerState: new Map<string, SpinnerState>(spinnerState),
    pressingSince: pressingSince.slice(),
  };
}
