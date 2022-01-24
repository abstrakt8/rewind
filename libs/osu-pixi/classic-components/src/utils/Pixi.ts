import { Sprite } from "@pixi/sprite";
import { DisplayObject } from "@pixi/display";
import { evaluateTransformations, TransformationProcess } from "./Transformations";
import { Texture } from "pixi.js";
import { applyInterpolation, Easing } from "@osujs/math";

export const createCenteredSprite = (): Sprite => {
  const sprite = new Sprite();
  sprite.anchor.set(0.5);
  return sprite;
};

export function setAlphaScaling(o: DisplayObject, alpha: number, scaling: number): void {
  o.alpha = alpha;
  o.scale.set(scaling);
}

/** TRANSFORMATIONS **/
// Animations [from, to)
// And boolean returns if a change was done

export function fading(
  o: DisplayObject,
  t: number,
  fromTime: number,
  toTime: number,
  startAlpha: number,
  endAlpha: number,
  easing = Easing.LINEAR,
): boolean {
  // toTime is exclusive
  if (fromTime <= t && t < toTime) {
    o.alpha = applyInterpolation(t, fromTime, toTime, startAlpha, endAlpha, easing);
    return true;
  } else if (toTime <= t) {
    o.alpha = endAlpha;
  } else {
    o.alpha = startAlpha;
  }
  return false;
}

export function fadeInFromTo(o: DisplayObject, t: number, from: number, to: number, easing = Easing.LINEAR): boolean {
  return fading(o, t, from, to, 0, 1, easing);
}

export function fadeInWithDuration(
  o: DisplayObject,
  t: number,
  from: number,
  duration: number,
  easing = Easing.LINEAR,
): boolean {
  return fadeInFromTo(o, t, from, from + duration, easing);
}

export function fadeOutFromTo(o: DisplayObject, t: number, from: number, to: number, easing = Easing.LINEAR): boolean {
  return fading(o, t, from, to, 1, 0, easing);
}

export function fadeOutWithDuration(
  o: DisplayObject,
  t: number,
  from: number,
  duration: number,
  easing = Easing.LINEAR,
): boolean {
  return fadeOutFromTo(o, t, from, from + duration, easing);
}

export function scaling(
  o: DisplayObject,
  t: number,
  fromTime: number,
  toTime: number,
  startVal: number,
  endVal: number,
  easing = Easing.LINEAR,
): boolean {
  // toTime is exclusive
  if (fromTime <= t && t < toTime) {
    o.scale.set(applyInterpolation(t, fromTime, toTime, startVal, endVal, easing));
    return true;
  } else if (toTime <= t) {
    o.scale.set(endVal);
  } else {
    o.scale.set(startVal);
  }
  return false;
}

export function scaleTo(
  o: DisplayObject,
  t: number,
  fromTime: number,
  toTime: number,
  endScaling: number,
  easing = Easing.LINEAR,
): boolean {
  return scaling(o, t, fromTime, toTime, 1, endScaling, easing);
}

export function scaleToWithDuration(
  o: DisplayObject,
  t: number,
  fromTime: number,
  duration: number,
  endScaling: number,
  easing = Easing.LINEAR,
): boolean {
  return scaleTo(o, t, fromTime, fromTime + duration, endScaling, easing);
}

// PIXI specific
export type DisplayObjectTransformationProcess = {
  alpha?: TransformationProcess<number>;
  scale?: TransformationProcess<number>;
  position?: TransformationProcess<{ x: number; y: number }>;
};

type AssignableDisplayObjectProperties = {
  alpha?: number;
  scale?: number; // could also do "number | {x, y}"
  position?: { x: number; y: number };
};

type DisplayObjectProperties = {
  alpha?: number;
  scale?: number; // could also do "number | {x, y}"
  position?: { x: number; y: number };
};

type AssignableSpriteProperties = AssignableDisplayObjectProperties & {
  tint?: number;
  texture?: Texture;
};

// Side effects from pixi must be considered.
// We can't just do something like `{...displayObject, ...props}` because the `.set()` methods has had effects such as changing other variables.
// For instance `displayObject.scale.set(x, y)` will also adjust the `height`, `width`, ...
export function applyPropertiesToDisplayObject(
  props: AssignableDisplayObjectProperties,
  displayObject: DisplayObject,
): void {
  const { alpha, scale, position } = props;

  // Can't check with `if(alpha)` because alpha could be zero and so on, that was a bug in a prior implementation.
  if (alpha !== undefined) displayObject.alpha = alpha;
  if (scale !== undefined) displayObject.scale.set(scale);
  if (position !== undefined) displayObject.position.set(position.x, position.y);
}

export const evaluateTransformationsToProperties = (
  process: DisplayObjectTransformationProcess,
  time: number,
  fallbackProperties?: DisplayObjectProperties,
): AssignableDisplayObjectProperties => {
  const { alpha, scale, position } = process;
  return {
    alpha: alpha !== undefined ? evaluateTransformations(alpha)(time) : fallbackProperties?.alpha,
    scale: scale !== undefined ? evaluateTransformations(scale)(time) : fallbackProperties?.scale,
    position: position !== undefined ? evaluateTransformations(position)(time) : fallbackProperties?.position,
  };
};

export const applyTransformationsToDisplayObject =
  (process: DisplayObjectTransformationProcess) => (displayObject: DisplayObject) => (time: number) => {
    const { alpha, position, scale } = process;
    if (alpha) displayObject.alpha = evaluateTransformations(alpha)(time);
    if (scale) displayObject.scale.set(evaluateTransformations(scale)(time));
    if (position) {
      const { x, y } = evaluateTransformations(position)(time);
      displayObject.position.set(x, y);
    }
    return displayObject;
  };
