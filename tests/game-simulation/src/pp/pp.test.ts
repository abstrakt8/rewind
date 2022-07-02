import { Blueprint, buildBeatmap } from "@osujs/core";
import { calculateDifficultyAttributes, calculatePerformanceAttributes, ScoreParams } from "@osujs/pp";
import { getBlueprintFromTestDir } from "../util";

function calculatePP(blueprint: Blueprint, scoreParams: ScoreParams) {
  const mods = scoreParams.mods;
  const beatmap = buildBeatmap(blueprint, { mods });

  const [finalAttributes] = calculateDifficultyAttributes(beatmap, true);
  const { total } = calculatePerformanceAttributes(finalAttributes, scoreParams);
  return total;
}

// TODO: Test it similarly as the SR calculation
// 1. Generate test cases into a .json file with the abstrakt8/osu repository
// 2. Parse those test cases and

describe("PP calculation", function () {
  describe("Lonely Go!", function () {
    const blueprint = getBlueprintFromTestDir(
      "863227 Brian The Sun - Lonely Go! (TV Size) [no video]/Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu",
    );
    // https://osu.ppy.sh/scores/osu/3160935737/
    it("Scores", function () {
      expect(
        calculatePP(blueprint, {
          mods: ["HARD_ROCK", "HIDDEN"],
          maxCombo: 569,
          countGreat: 352,
          countOk: 0,
          countMeh: 0,
          countMiss: 0,
        }),
      ).toBeCloseTo(435.556, 3);
    });
  });
  describe("Hidamari no Uta", function () {
    const blueprint = getBlueprintFromTestDir(
      "931596 Apol - Hidamari no Uta/Apol - Hidamari no Uta (-Keitaro) [Expert].osu",
    );
    // https://osu.ppy.sh/scores/osu/2863181831/
    it("double tapping punishment", function () {
      const counts = [908, 46, 40, 0];
      const [countGreat, countOk, countMeh, countMiss] = counts;
      expect(
        calculatePP(blueprint, {
          mods: ["DOUBLE_TIME", "HIDDEN"],
          maxCombo: 1484,
          countGreat,
          countOk,
          countMeh,
          countMiss,
        }),
      ).toBeCloseTo(349.171, 2);
    });
  });
});

// TODO: Use the ones from osu! Lazer testcases: one is called "diffcalc-test.osu"
