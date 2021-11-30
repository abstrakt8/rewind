import { DEFAULT_BEATMAP_DIFFICULTY } from "../beatmap/BeatmapDifficulty";
import { HardRockMod } from "./HardRockMod";
import { EasyMod } from "./EasyMod";

describe("HardRock", function () {
  describe("BeatmapDifficulty adjusting", function () {
    it("should adjust to 10 max", function () {
      const original = {
        ...DEFAULT_BEATMAP_DIFFICULTY,
        approachRate: 8,
        drainRate: 9,
        overallDifficulty: 8,
        circleSize: 4,
      };
      const expected = {
        ...DEFAULT_BEATMAP_DIFFICULTY,
        approachRate: 10,
        drainRate: 10,
        overallDifficulty: 10,
        circleSize: 5.2,
      };
      const actual = HardRockMod.difficultyAdjuster(original);
      expect(actual).toEqual(expected);
    });
  });
});

test("EasyMod should half AR, OD, CS, HP ", () => {
  const original = {
    ...DEFAULT_BEATMAP_DIFFICULTY,
    approachRate: 8,
    drainRate: 9,
    overallDifficulty: 8,
    circleSize: 4,
  };
  const expected = {
    ...DEFAULT_BEATMAP_DIFFICULTY,
    approachRate: 4,
    drainRate: 4.5,
    overallDifficulty: 4,
    circleSize: 2,
  };
  const actual = EasyMod.difficultyAdjuster(original);
  expect(actual).toEqual(expected);

  // Test immutability
  expect(original.approachRate).toEqual(8);
});
