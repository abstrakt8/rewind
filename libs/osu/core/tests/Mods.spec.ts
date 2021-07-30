import { describe } from "mocha";
import { HardRockMod } from "../src/beatmap/mods/HardRockMod";
import { DEFAULT_BEATMAP_DIFFICULTY } from "../src";
import { expect } from "chai";

describe("HardRock", function () {
  const mod = new HardRockMod();

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
      const actual = mod.difficultyApplier(original);
      expect(actual).to.be.deep.equal(expected);
    });
  });
});
