export function approximatelyEqual(x: number, y: number, delta: number): boolean {
  return Math.abs(x - y) < delta;
}

// https://github.com/ppy/osu-framework/blob/105a17bc99cad251fa730b54c615d2b0d9a409d3/osu.Framework/Utils/Precision.cs
const FLOAT_EPS = 1e-3;

export function floatEqual(value1: number, value2: number): boolean {
  return approximatelyEqual(value1, value2, FLOAT_EPS);
}

// Don't know when this is used, but it's mentioned in osu!lazer
const DOUBLE_EPS = 1e-7;

export function doubleEqual(x: number, y: number): boolean {
  return approximatelyEqual(x, y, DOUBLE_EPS);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
