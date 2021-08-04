import { SliderCheckPointType } from "../Types";

export type SliderCheckPointDescriptor = {
  type: SliderCheckPointType;

  // The time when the slider ball should be tracked in order for the checkpoint to be considered "hit".
  time: number;

  // In a slider with repeat = 3, the spanIndex can range from 0 to 2.
  spanIndex: number;

  // The startTime of the span is useful for calculating visual stuff.
  spanStartTime: number;

  // The progress in ONE span. So first SliderRepeat would have pathProgress=1, second one would have pathProgress = 0 and so on.
  pathProgress: number;
};
