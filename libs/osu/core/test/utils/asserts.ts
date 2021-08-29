import { Position } from "@rewind/osu/math";

export function assertPositionEqual(actual: Position, expected: Position, numDigits?: number) {
  expect(actual.x).toBeCloseTo(expected.x, numDigits);
  expect(actual.y).toBeCloseTo(expected.y, numDigits);
}

export function arrayEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
