import { join } from "path";
import { readFileSync } from "fs";
import { Blueprint, buildBeatmap, OsuClassicMod, parseBlueprint } from "@osujs/core";
import { calculateDifficultyAttributes } from "./diff";
import { calculatePerformanceAttributes, ScoreParams } from "./pp";

// Move these to integration tests

function getBlueprint(name: string) {
  const data = readFileSync(name, "utf-8");
  return parseBlueprint(data);
}

function starRating(blueprint: Blueprint, mods: OsuClassicMod[] = []) {
  const beatmap = buildBeatmap(blueprint, { mods });
  const [lastAttributes] = calculateDifficultyAttributes(beatmap, true);
  return lastAttributes.starRating;
}


// TODO: Make it more dynamic
// Once a rework hits, we need to adjust the test cases again, but I think then you want to generate those SR
// with the official osu! lazer code instead -> output it into a json file or something

function calculatePP(blueprint: Blueprint, scoreParams: ScoreParams) {
  const mods = scoreParams.mods;
  const beatmap = buildBeatmap(blueprint, { mods });

  const [finalAttributes] = calculateDifficultyAttributes(beatmap, true);
  const { total } = calculatePerformanceAttributes(finalAttributes, scoreParams);
  return total;
}

// Whenever there are some crazy accurate values, these are directly from osu!lazer

const rewindTestOsuDir = join(process.env.REWIND_TEST_DIR || "", "osu!");

export function testBlueprintPath(fileName: string): string {
  return join(rewindTestOsuDir, "Songs", fileName);
}

const violetPerfume = testBlueprintPath(
  "1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu",
);
const lonelyGo = testBlueprintPath(
  "863227 Brian The Sun - Lonely Go! (TV Size) [no video]\\Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu",
);
const hidamariNoUta = testBlueprintPath(
  "931596 Apol - Hidamari no Uta\\Apol - Hidamari no Uta (-Keitaro) [Expert].osu",
);
const timeFreeze = testBlueprintPath(
  "158023 UNDEAD CORPORATION - Everything will freeze\\UNDEAD CORPORATION - Everything will freeze (Ekoro) [Time Freeze].osu",
);

describe("SR calculation", function() {
  // Only has hit circles
  describe("Violet Perfume", function() {
    // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
    const blueprint = getBlueprint(violetPerfume);
    it("NM", function() {
      const expectedStarRating = 4.6626936826380652;
      expect(starRating(blueprint, [])).toBeCloseTo(expectedStarRating, 2);
    });
    it("DT", function() {
      expect(starRating(blueprint, ["DOUBLE_TIME"])).toBeCloseTo(6.5984001716972429, 2);
    });
  });

  // Has some sliders and hit circles
  describe("Lonely Go! Fiery's Extreme", function() {
    const blueprint = getBlueprint(lonelyGo);

    it("NM/HD", function() {
      // The only that is calculated from lazer directly
      const expectedStarRating = 6.3331461484197025;
      expect(starRating(blueprint, [])).toBeCloseTo(expectedStarRating, 5);
      expect(starRating(blueprint, ["HIDDEN"])).toBeCloseTo(expectedStarRating, 5);
    });
    it("DT/NC", function() {
      const expectedStarRating = 8.7425958639117809;
      expect(starRating(blueprint, ["DOUBLE_TIME"])).toBeCloseTo(expectedStarRating, 5);
      expect(starRating(blueprint, ["NIGHT_CORE"])).toBeCloseTo(expectedStarRating, 5);
    });
    it("HR", function() {
      expect(starRating(blueprint, ["HARD_ROCK"])).toBeCloseTo(6.82, 2);
    });
    // TODO
    // it("FL", function() {
    //   expect(starRating(blueprint, ["FLASH_LIGHT"])).toBeCloseTo(6.94, 2);
    // })
    it("DTHR", function() {
      expect(starRating(blueprint, ["HARD_ROCK", "DOUBLE_TIME"])).toBeCloseTo(9.43, 2);
    });
  });

  describe("Hidamari no Uta", function() {
    const blueprint = getBlueprint(hidamariNoUta);
    it("HDDT", function() {
      expect(starRating(blueprint, ["HIDDEN", "DOUBLE_TIME"])).toBeCloseTo(8.34, 1);
    });
  });

  describe("Everything will freeze (Time Freeze)", function() {
    const blueprint = getBlueprint(timeFreeze);
    it("NM -> HR -> NM", function() {
      const nmStarRating = 8.05;
      expect(starRating(blueprint, [])).toBeCloseTo(nmStarRating, 2);
      expect(starRating(blueprint, ["HARD_ROCK"])).toBeCloseTo(9.0, 2);
      expect(starRating(blueprint, [])).toBeCloseTo(nmStarRating, 2);
    });
  });
});

describe("PP calculation", function() {
  describe("Lonely Go!", function() {
    const blueprint = getBlueprint(lonelyGo);
    // https://osu.ppy.sh/scores/osu/3160935737/
    it("Scores", function() {
      expect(
        calculatePP(blueprint, {
          mods: ["HARD_ROCK", "HIDDEN"],
          maxCombo: 569,
          countGreat: 352,
          countOk: 0,
          countMeh: 0,
          countMiss: 0,
        }),
      ).toBeCloseTo(435.22938962417305, 3);
    });
  });
  describe("Hidamari no Uta", function() {
    const blueprint = getBlueprint(hidamariNoUta);
    // https://osu.ppy.sh/scores/osu/2863181831/
    it("double tapping punishment", function() {
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
      ).toBeCloseTo(348.02098088708914, 2);
    });
  });
});

// TODO: Use the ones from osu! "diffcalc-test.osu"
