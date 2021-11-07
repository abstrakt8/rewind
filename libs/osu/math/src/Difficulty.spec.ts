import { approachRateToApproachDuration, circleSizeToScale } from "./Difficulty";

test("approachRateToApproachDuration", function () {
  expect(approachRateToApproachDuration(10)).toEqual(450);
  expect(approachRateToApproachDuration(5)).toEqual(1200);
  expect(approachRateToApproachDuration(0)).toEqual(1800);
});

test("circleSizeToScale", function () {
  expect(circleSizeToScale(4)).toEqual(0.57);
});
