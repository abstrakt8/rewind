import { Position } from "@rewind/osu/math";
import { normalizeHitObjects } from "../utils";
import { GameState } from "./GameState";
import { Slider } from "../hitobjects/Slider";
import { HitCircle } from "../hitobjects/HitCircle";
import { MainHitObjectVerdict } from "./Verdicts";
import { OsuHitObject } from "../hitobjects/Types";

/**
 * ReplayAnalysisEvents are point of interests for the user.
 *
 */

export type GameplayAnalysisEventType = "HitObjectJudgement" | "CheckpointJudgement" | "UnnecessaryClick";

// Where and when to display these events
interface DisplayBase {
  type: GameplayAnalysisEventType;
  time: number;
  position: Position;
}

// TODO: Export
type HitObjectVerdict = MainHitObjectVerdict;

// Those events are to be displayed on the screen

export interface HitObjectJudgement extends DisplayBase {
  type: "HitObjectJudgement";
  verdict: HitObjectVerdict;
  hitObjectId: string;
  // Because people might want to prefer not showing slider head judgements
  // In Lazer they are shown
  isSliderHead?: boolean;
}

export interface CheckpointJudgement extends DisplayBase {
  type: "CheckpointJudgement";
  hit: boolean;
  // Usually not the causing factor of a slider break
  isLastTick?: boolean;
}

// Used in the future, but just shows that these events are extendable.
export interface UnnecessaryClick extends DisplayBase {
  type: "UnnecessaryClick";
}

export type ReplayAnalysisEvent = HitObjectJudgement | CheckpointJudgement | UnnecessaryClick;

// Type predicates
export const isHitObjectJudgement = (h: ReplayAnalysisEvent): h is HitObjectJudgement =>
  h.type === "HitObjectJudgement";

// This is osu!stable style and is also only recommended for offline processing.
// In the future, where something like online replay streaming is implemented, this implementation will ofc be too slow.
export function retrieveEvents(gameState: GameState, hitObjects: OsuHitObject[]) {
  const events: ReplayAnalysisEvent[] = [];
  const dict = normalizeHitObjects(hitObjects);

  // HitCircle judgements (SliderHeads included and indicated)
  for (const id in gameState.hitCircleVerdict) {
    const state = gameState.hitCircleVerdict[id];
    const hitCircle = dict[id] as HitCircle;
    const isSliderHead = hitCircle.sliderId !== undefined;
    const verdict = state.type;
    events.push({
      type: "HitObjectJudgement",
      time: state.judgementTime,
      hitObjectId: id,
      position: hitCircle.position,
      verdict,
      isSliderHead,
    });
  }

  for (const id in gameState.sliderVerdict) {
    const verdict = gameState.sliderVerdict[id];
    // Slider judgement events
    const slider = dict[id] as Slider;
    const position = slider.endPosition;
    events.push({ time: slider.endTime, hitObjectId: id, position, verdict, type: "HitObjectJudgement" });

    // CheckpointEvents
    for (const point of slider.checkPoints) {
      const checkPointState = gameState.checkPointVerdict[point.id];
      const hit = checkPointState?.hit ?? false;

      const isLastTick = point.type === "LAST_LEGACY_TICK";
      events.push({ time: slider.endTime, position: point.position, type: "CheckpointJudgement", hit, isLastTick });
    }
  }

  // TODO: Spinner nested ticks events

  return events;
}
