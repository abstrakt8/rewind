import { determineDefaultPlaybackSpeed } from "./index";

describe("determineDefaultPlaybackSpeed", function () {
  it("DT/NC -> 1.5", function () {
    expect(determineDefaultPlaybackSpeed(["NIGHT_CORE"])).toEqual(1.5);
    expect(determineDefaultPlaybackSpeed(["DOUBLE_TIME"])).toEqual(1.5);
  });
  it("HT -> 0.75", function () {
    expect(determineDefaultPlaybackSpeed(["HALF_TIME"])).toEqual(0.75);
  });
  it("Default -> 1.0", function () {
    expect(determineDefaultPlaybackSpeed(["HIDDEN"])).toEqual(1.0);
    expect(determineDefaultPlaybackSpeed([])).toEqual(1.0);
  });
});
