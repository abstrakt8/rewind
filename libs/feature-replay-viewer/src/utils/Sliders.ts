import { Position, Vec2 } from "@rewind/osu/math";

// TODO: Maybe move this to osu/Math

// Maybe this is slow because of atan2() calculation
export function sliderRepeatAngle(curve: Position[], isRepeatAtEnd: boolean): number {
  if (curve.length < 2) {
    return 0.0;
  }

  const searchStart = isRepeatAtEnd ? curve.length - 1 : 0;
  const searchDir = isRepeatAtEnd ? -1 : +1;
  // I think the special case happening in DrawableRepeatSlider only occurs at snaking (which we don't have right
  // now).
  // So TODO: implement searching for two unique points when we do snaking
  const p1 = curve[searchStart];
  const p2 = curve[searchStart + searchDir];
  const direction = Vec2.sub(p2, p1);
  return Math.atan2(direction.y, direction.x);
}
