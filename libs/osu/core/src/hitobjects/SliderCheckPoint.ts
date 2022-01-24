import { Slider } from "./Slider";
import { Position, Vec2 } from "@osujs/math";
import { HasHitTime, HasId, HasPosition } from "./Properties";
import { SliderCheckPointType } from "./Types";

// Important points on the slider. Depending on if they were "hit" or not, we will have a different judgement on the
// slider.
export class SliderCheckPoint implements HasId, HasPosition, HasHitTime {
  constructor(public readonly slider: Slider) {}

  id = "";
  type: SliderCheckPointType = "TICK";
  spanIndex = 0;
  // The `spanProgress` is a number between 0 and 1 that determines the position on the slider path.
  spanProgress = 0;
  spanStartTime = 0;
  offset: Position = { x: 0, y: 0 };

  hitTime = 0;

  get position(): Position {
    return Vec2.add(this.slider.startPosition, this.offset);
  }

  get scale(): number {
    return this.slider.scale;
  }
}
