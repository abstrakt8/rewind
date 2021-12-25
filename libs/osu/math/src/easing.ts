// https://github.com/ppy/osu-framework/blob/master/osu.Framework/Graphics/Transforms/DefaultEasingFunction.cs
export enum Easing {
  LINEAR,
  OUT,
  OUT_QUINT,
  OUT_ELASTIC,
  IN_CUBIC,
}

const elastic_const = (2 * Math.PI) / 0.3;
const elastic_const2 = 0.3 / 4;
const back_const = 1.70158;
const back_const2 = back_const * 1.525;
const bounce_const = 1 / 2.75;
// constants used to fix expo and elastic curves to start/end at 0/1
const expo_offset = Math.pow(2, -10);
const elastic_offset_full = Math.pow(2, -11);
const elastic_offset_half = Math.pow(2, -10) * Math.sin((0.5 - elastic_const2) * elastic_const);
const elastic_offset_quarter = Math.pow(2, -10) * Math.sin((0.25 - elastic_const2) * elastic_const);
const in_out_elastic_offset = Math.pow(2, -10) * Math.sin(((1 - elastic_const2 * 1.5) * elastic_const) / 1.5);

export function applyEasing(t: number, easing: Easing): number {
  switch (easing) {
    case Easing.LINEAR:
      return t;
    case Easing.OUT:
      return t * (2 - t);
    case Easing.OUT_QUINT:
      return --t * t * t * t * t + 1;
    case Easing.OUT_ELASTIC:
      return Math.pow(2, -10 * t) * Math.sin((t - elastic_const2) * elastic_const) + 1 - elastic_offset_full * t;
    case Easing.IN_CUBIC:
      return t * t * t;
  }
  return t;
}

export function applyInterpolation(
  time: number,
  startTime: number,
  endTime: number,
  valA: number,
  valB: number,
  easing = Easing.LINEAR,
): number {
  // Or floatEqual ...
  if (startTime >= endTime) {
    console.error("startTime should be less than endTime");
    return valA; // or throw Error?
  }
  const p = applyEasing((time - startTime) / (endTime - startTime), easing);
  return (valB - valA) * p + valA;
}

/**
 * Linear interpolation
 * @param start start value
 * @param final final value
 * @param amount number between 0 and 1
 */
export function lerp(start: number, final: number, amount: number) {
  return start + (final - start) * amount;
}
