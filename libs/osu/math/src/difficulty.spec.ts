import { approachRateToApproachDuration, circleSizeToScale } from "./difficulty";

test("approachRateToApproachDuration", function () {
  expect(approachRateToApproachDuration(10)).toEqual(450);
  expect(approachRateToApproachDuration(5)).toEqual(1200);
  expect(approachRateToApproachDuration(0)).toEqual(1800);
});

test("circleSizeToScale", function () {
  expect(circleSizeToScale(4)).toBeCloseTo(0.57, 5);
});
