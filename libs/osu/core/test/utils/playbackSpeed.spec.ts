import { determineDefaultPlaybackSpeed } from "@rewind/osu/core";

test("Expect playback speed", () => {
  expect(determineDefaultPlaybackSpeed(["NIGHT_CORE"])).toEqual(1.5);
  expect(determineDefaultPlaybackSpeed(["DOUBLE_TIME"])).toEqual(1.5);
  expect(determineDefaultPlaybackSpeed(["HALF_TIME"])).toEqual(0.75);
  expect(determineDefaultPlaybackSpeed(["HIDDEN"])).toEqual(1.0);
  expect(determineDefaultPlaybackSpeed([])).toEqual(1.0);
});
