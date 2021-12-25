import { readFileSync } from "fs";
import { Blueprint, buildBeatmap, OsuClassicMod, parseBlueprint } from "@rewind/osu/core";
import { calculateDifficultyAttributes } from "./diff";

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

// Whenever there are some crazy accurate values, these are directly from osu!lazer

describe("SR calculation", function () {
  // Only has hit circles
  describe("Violet Perfume", function () {
    // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
    const file =
      "E:\\osu!\\Songs\\1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu";
    const blueprint = getBlueprint(file);
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
    const file =
      "E:\\osu!\\Songs\\863227 Brian The Sun - Lonely Go! (TV Size) [no video]\\Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu";
    const blueprint = getBlueprint(file);

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
    // it("FL", function() {
    //   expect(starRating(blueprint, ["FLASH_LIGHT"])).toBeCloseTo(6.94, 2);
    // })
    it("DTHR", function () {
      expect(starRating(blueprint, ["HARD_ROCK", "DOUBLE_TIME"])).toBeCloseTo(9.43, 2);
    });
  });
});

// TODO: Use the ones from osu! "diffcalc-test.osu"
