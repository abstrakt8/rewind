import { readFileSync } from "fs";
import {
  Blueprint,
  buildBeatmap,
  determineDefaultPlaybackSpeed,
  isHitCircle,
  isSlider,
  isSpinner,
  OsuClassicMod,
  OsuHitObject,
  parseBlueprint,
} from "@rewind/osu/core";
import { calculateDifficultyAttributes } from "./diff";
import { calculatePerformanceAttributes, ScoreParams } from "./pp";
import {
  approachDurationToApproachRate,
  approachRateToApproachDuration,
  hitWindowGreatToOD,
  overallDifficultyToHitWindowGreat,
} from "@rewind/osu/math";

// Move these to integration tests

function getBlueprint(name: string) {
  const data = readFileSync(name, "utf-8");
  return parseBlueprint(data);
}

function starRating(blueprint: Blueprint, mods: OsuClassicMod[] = []) {
  const beatmap = buildBeatmap(blueprint, { mods });

  const attributes = calculateDifficultyAttributes(
    beatmap.hitObjects,
    beatmap.appliedMods,
    beatmap.difficulty.overallDifficulty,
  );

  expect(attributes.length).toEqual(beatmap.hitObjects.length);
  const lastAttributes = attributes[attributes.length - 1];
  return lastAttributes.starRating;
}

function determineMaxCombo(hitObjects: OsuHitObject[]) {
  let maxCombo = 0;
  let hitCircleCount = 0,
    sliderCount = 0,
    spinnerCount = 0;

  for (const o of hitObjects) {
    maxCombo++;
    if (isHitCircle(o)) hitCircleCount++;
    if (isSpinner(o)) spinnerCount++;
    if (isSlider(o)) {
      sliderCount++;
      maxCombo += o.checkPoints.length;
    }
  }
  return { maxCombo, hitCircleCount, sliderCount, spinnerCount };
}

const speedAdjustedAR = (AR: number, clockRate: number) =>
  approachDurationToApproachRate(approachRateToApproachDuration(AR) / clockRate);
const speedAdjustedOD = (OD: number, clockRate: number) =>
  hitWindowGreatToOD(overallDifficultyToHitWindowGreat(OD) / clockRate);

function calculatePP(blueprint: Blueprint, scoreParams: ScoreParams) {
  const mods = scoreParams.mods;
  const { appliedMods, difficulty, hitObjects } = buildBeatmap(blueprint, { mods });
  const attributes = calculateDifficultyAttributes(hitObjects, appliedMods, difficulty.overallDifficulty);

  const { aimDifficulty, speedDifficulty, flashlightDifficulty, sliderFactor } = attributes[attributes.length - 1];

  const { hitCircleCount, sliderCount, spinnerCount, maxCombo } = determineMaxCombo(hitObjects);
  const clockRate = determineDefaultPlaybackSpeed(mods);

  const overallDifficulty = speedAdjustedOD(difficulty.overallDifficulty, clockRate);
  const approachRate = speedAdjustedAR(difficulty.approachRate, clockRate);

  const { total } = calculatePerformanceAttributes(
    {
      aimDifficulty,
      speedDifficulty,
      flashlightDifficulty,
      sliderFactor,

      maxCombo,
      sliderCount,
      spinnerCount,
      hitCircleCount,

      overallDifficulty,
      approachRate,
      drainRate: difficulty.drainRate,
    },
    scoreParams,
  );
  return total;
}

// Whenever there are some crazy accurate values, these are directly from osu!lazer
const violetPerfume =
  "E:\\osu!\\Songs\\1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu";
const lonelyGo =
  "E:\\osu!\\Songs\\863227 Brian The Sun - Lonely Go! (TV Size) [no video]\\Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu";
const hidamariNoUta = "E:\\osu!\\Songs\\931596 Apol - Hidamari no Uta\\Apol - Hidamari no Uta (-Keitaro) [Expert].osu";

describe("SR calculation", function () {
  // Only has hit circles
  describe("Violet Perfume", function () {
    // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
    const blueprint = getBlueprint(violetPerfume);
    it("NM", function () {
      const expectedStarRating = 4.6626936826380652;
      expect(starRating(blueprint, [])).toBeCloseTo(expectedStarRating, 2);
    });
    it("DT", function () {
      expect(starRating(blueprint, ["DOUBLE_TIME"])).toBeCloseTo(6.5984001716972429, 2);
    });
  });

  // Has some sliders and hit circles
  describe("Lonely Go! Fiery's Extreme", function () {
    const blueprint = getBlueprint(lonelyGo);

    it("NM/HD", function () {
      // The only that is calculated from lazer directly
      const expectedStarRating = 6.3331461484197025;
      expect(starRating(blueprint, [])).toBeCloseTo(expectedStarRating, 5);
      expect(starRating(blueprint, ["HIDDEN"])).toBeCloseTo(expectedStarRating, 5);
    });
    it("DT/NC", function () {
      const expectedStarRating = 8.7425958639117809;
      expect(starRating(blueprint, ["DOUBLE_TIME"])).toBeCloseTo(expectedStarRating, 5);
      expect(starRating(blueprint, ["NIGHT_CORE"])).toBeCloseTo(expectedStarRating, 5);
    });
    it("HR", function () {
      expect(starRating(blueprint, ["HARD_ROCK"])).toBeCloseTo(6.82, 2);
    });
    // TODO
    // it("FL", function() {
    //   expect(starRating(blueprint, ["FLASH_LIGHT"])).toBeCloseTo(6.94, 2);
    // })
    it("DTHR", function () {
      expect(starRating(blueprint, ["HARD_ROCK", "DOUBLE_TIME"])).toBeCloseTo(9.43, 2);
    });
  });

  describe("Hidamari no Uta", function () {
    const blueprint = getBlueprint(hidamariNoUta);
    it("HDDT", function () {
      expect(starRating(blueprint, ["HIDDEN", "DOUBLE_TIME"])).toBeCloseTo(8.34, 1);
    });
  });
});

describe("PP calculation", function () {
  describe("Lonely Go!", function () {
    const blueprint = getBlueprint(lonelyGo);
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
      ).toBeCloseTo(435.22938962417305, 3);
    });
  });
  describe("Hidamari no Uta", function () {
    const blueprint = getBlueprint(hidamariNoUta);
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
      ).toBeCloseTo(348.02098088708914, 2);
    });
  });
});

// TODO: Use the ones from osu! "diffcalc-test.osu"
