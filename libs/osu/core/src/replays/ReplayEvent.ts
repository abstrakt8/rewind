import {
  HitCircle,
  HitObjectJudgementType,
  OsuHitObject,
  ReplayState,
  Slider,
  SliderCheckPointType,
} from "@rewind/osu/core";
import { Position } from "@rewind/osu/math";
import { normalizeHitObjects } from "../utils";

export enum ReplayAnalysisEventType {
  // Those are judgements
  MISS = "MISS",
  MEH = "MEH",
  OK = "OK",
  GREAT = "GREAT", // only someone who is going for lowest acc would look at this

  // Technically the following two can be considered cause a "slider break".
  SLIDER_HEAD_MISS = "SLIDER_HEAD_MISS",
  SLIDER_INNER_CHECKPOINT_MISS = "SLIDER_INNER_CHECKPOINT_MISS",
  SLIDER_END_MISSED = "SLIDER_END_MISSED",

  // Future ideas
  UNNECESSARY_CLICK = "UNNECESSARY_CLICK", // as the name says, but a bit less punishing
  THAT_WAS_CLOSE = "THAT_WAS_CLOSE", // when the hit circle was barely hit
}

export interface ReplayAnalysisEvent {
  time: number;
  position: Position;
  type: ReplayAnalysisEventType;
  description?: string; // explaining why it happened (e.g. cursor was outside, )
}

function mapJudgement(t: HitObjectJudgementType): ReplayAnalysisEventType {
  switch (t) {
    case HitObjectJudgementType.Ok:
      return ReplayAnalysisEventType.OK;
    case HitObjectJudgementType.Meh:
      return ReplayAnalysisEventType.MEH;
    case HitObjectJudgementType.Great:
      return ReplayAnalysisEventType.GREAT;
    case HitObjectJudgementType.Miss:
      return ReplayAnalysisEventType.MISS;
  }
}

// This is osu!stable style and is also only recommended for offline processing.
// In the future, where something like online replay streaming is implemented, this implementation will ofc be too slow.
export function retrieveEvents(replayState: ReplayState, hitObjects: OsuHitObject[]) {
  const events: ReplayAnalysisEvent[] = [];
  const dict = normalizeHitObjects(hitObjects);

  // HitCircle events (this includes slider heads)
  for (const [id, state] of replayState.hitCircleState.entries()) {
    const hitCircle = dict[id] as HitCircle;
    let type;

    // SliderHeadMisses are the only ones we are going to distinguish from the other misses
    // SliderHeadMisses are NOT rendered in stable, but they are in osu!lazer (which makes sense)
    if (state.type === HitObjectJudgementType.Miss) {
      type = hitCircle.sliderId !== undefined ? ReplayAnalysisEventType.SLIDER_HEAD_MISS : ReplayAnalysisEventType.MISS;
    } else {
      type = mapJudgement(state.type);
    }

    events.push({ time: state.judgementTime, position: hitCircle.position, type });
  }

  // Slider judgement events
  // Slider misses only happen if zero checkpoints have been hit (head is also a checkpoint in osu!stable).
  for (const [id, judgement] of replayState.sliderJudgement.entries()) {
    // time would only be at slider end time
    const slider = dict[id] as Slider;
    const type = mapJudgement(judgement);
    const position = slider.endPosition;
    events.push({ time: slider.endTime, position, type });

    // Check for the slider for slider breaks
    for (const point of slider.checkPoints) {
      const hit = replayState.checkPointState.get(point.id);
      if (hit) continue; // uninteresting at the moment

      let type;
      if (point.type === SliderCheckPointType.LAST_LEGACY_TICK) {
        type = ReplayAnalysisEventType.SLIDER_END_MISSED;
      } else {
        type = ReplayAnalysisEventType.SLIDER_INNER_CHECKPOINT_MISS;
      }

      events.push({ time: slider.endTime, position: point.position, type });
    }
  }

  // TODO: Spinner events

  return events;
}
