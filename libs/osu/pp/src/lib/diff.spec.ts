import { readFileSync } from "fs";
import { buildBeatmap, OsuClassicMod, parseBlueprint } from "@rewind/osu/core";
import { calculateDifficultyAttributes } from "./diff";

function calc(name: string, mods: OsuClassicMod[] = []) {
  const data = readFileSync(name, "utf-8");
  const blueprint = parseBlueprint(data);

  const beatmap = buildBeatmap(blueprint, { mods: [] });

  const attributes = calculateDifficultyAttributes(
    beatmap.hitObjects,
    beatmap.appliedMods,
    beatmap.difficulty.overallDifficulty,
  );

  return { beatmap, attributes };
}

describe("PP Test", function () {
  const expectedStarRating = 4.66;

  it("only hit circles", function () {
    // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
    // Violet perfume
    const file =
      "E:\\osu!\\Songs\\1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu";
    const { attributes, beatmap } = calc(file, []);
    expect(attributes.length).toEqual(beatmap.hitObjects.length);
    expect(attributes[attributes.length - 1].starRating).toBeCloseTo(expectedStarRating, 2);
  });

  it("with sliders", function () {
    // https://osu.ppy.sh/beatmapsets/863227#osu/1860433
    // 6.86 -> 6.34
    const file =
      "E:\\osu!\\Songs\\863227 Brian The Sun - Lonely Go! (TV Size)\\Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu";
    const expectedStarRating = 6.34;
    const { attributes } = calc(file, []);
    expect(attributes[attributes.length - 1].starRating).toBeCloseTo(expectedStarRating, 2);
  });
});

// TODO: Use the ones from osu! "diffcalc-test.osu"
