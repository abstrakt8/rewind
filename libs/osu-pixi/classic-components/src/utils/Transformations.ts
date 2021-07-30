// Functional programming is sometimes so neat.

import { applyEasing, clamp, Easing } from "@rewind/osu/math";

export const easingFunction =
  (easing: Easing) =>
  (t: number): number =>
    applyEasing(t, easing);

// We need one for Vector2 as well
export const clampedInterpolationFunction =
  (startTime: number, endTime: number, valA: number, valB: number, easing = Easing.LINEAR) =>
  (time: number): number => {
    if (startTime >= endTime) {
      return valB; // Technically speaking the result is undefined
    } else {
      const p = easingFunction(easing)(clamp((time - startTime) / (endTime - startTime), 0, 1));
      return (valB - valA) * p + valA;
    }
  };

// yes time independent
export const instantAssignValueTo =
  <T>(atTime: number, val: T) =>
  (time: number): T =>
    val;

/// HANDY ALIASES

type FunctionOverTime<T> = (time: number) => T;

export const numericTransformTo =
  (endValue: number, easing = Easing.LINEAR) =>
  (startValue: number, fromTime: number, toTime: number): FunctionOverTime<number> =>
    clampedInterpolationFunction(fromTime, toTime, startValue, endValue, easing);

export const fadeTo = (endAlpha: number, easing = Easing.LINEAR) => numericTransformTo(endAlpha, easing);
export const fadeInT = (endAlpha = 1, easing = Easing.LINEAR) => fadeTo(endAlpha, easing);
export const fadeOutT = (endAlpha = 0, easing = Easing.LINEAR) => fadeTo(endAlpha, easing);

export const scaleToT = (endScaling: number, easing = Easing.LINEAR) => numericTransformTo(endScaling, easing);

export type Transformation<T> = {
  time: [number, number];
  func: (startValue: T, fromTime: number, toTime: number) => FunctionOverTime<T>;
};

// I'm bad at naming...
export type TransformationProcess<T> = {
  startValue: T;
  transformations?: Transformation<T>[];
};

// Assuming that the transformations are sorted and they are not intersecting
export const evaluateTransformations =
  <T>(process: TransformationProcess<T>) =>
  (time: number): T => {
    const { startValue, transformations } = process;
    // Yes, I could also return evaluateTransformation(transformations[1..]) to make it more FP-ish...
    let value = startValue;
    if (!transformations) {
      return value;
    }
    for (let i = 0; i < transformations.length; i++) {
      const [a, b] = transformations[i].time;
      if (time <= a) return value;
      // b < time could occur, but in this case, we will have clamping coming in handy
      value = transformations[i].func(value, a, b)(time);
    }
    return value;
  };
