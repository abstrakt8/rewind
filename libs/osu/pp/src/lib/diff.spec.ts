import { readFileSync, writeFileSync } from "fs";
import { buildBeatmap, parseBlueprint } from "@rewind/osu/core";
import { calculateDifficultyAttributes } from "./diff";

describe("PP Test", function () {
  // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
  // vioelt perfume

  const file = "E:\\osu!\\Songs\\1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu";
  const expectedStarRating = 4.66;

  // https://osu.ppy.sh/beatmapsets/863227#osu/1860433
  // 6.86 -> 6.34
  // const file =    "E:\\osu!\\Songs\\863227 Brian The Sun - Lonely Go! (TV Size)\\Brian The Sun - Lonely Go! (TV
  // Size) (Nevo) [Fiery's Extreme].osu"; const expectedStarRating = 6.34;
  const data = readFileSync(file, "utf-8");

  const blueprint = parseBlueprint(data);

  const beatmap = buildBeatmap(blueprint, { mods: [] });

  const attributes = calculateDifficultyAttributes(
    beatmap.hitObjects,
    beatmap.appliedMods,
    beatmap.difficulty.overallDifficulty,
  );

  writeFileSync("sr.json", JSON.stringify(attributes));

  expect(attributes.length).toEqual(beatmap.hitObjects.length);
  expect(attributes[attributes.length - 1].starRating).toBeCloseTo(expectedStarRating, 2);
});
