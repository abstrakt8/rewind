import { calculateAccuracyDigits, calculateDigits } from "./numbers";

test("normal digits", () => {
  expect(calculateDigits(0)).toEqual([0]);
  expect(calculateDigits(1)).toEqual([1]);
  expect(calculateDigits(123)).toEqual([1, 2, 3]);
});

test("acc digits", () => {
  expect(calculateAccuracyDigits(0.123)).toEqual([
    [1, 2],
    [3, 0],
  ]);
  expect(calculateAccuracyDigits(0.0)).toEqual([[0], [0, 0]]);
  expect(calculateAccuracyDigits(1.0)).toEqual([
    [1, 0, 0],
    [0, 0],
  ]);

  // Should round down
  expect(calculateAccuracyDigits(0.12349)).toEqual([
    [1, 2],
    [3, 4],
  ]);

  expect(calculateAccuracyDigits(0.9999999)).toEqual([
    [9, 9],
    [9, 9],
  ]);

  expect(calculateAccuracyDigits(0.0001)).toEqual([[0], [0, 1]]);

  const a = 0.9875776397515528;
  expect(calculateAccuracyDigits(0.9875776397515528)).toEqual([
    [9, 8],
    [7, 5],
    // [7, 6], In stable it's 98.76% OK
  ]);
});
