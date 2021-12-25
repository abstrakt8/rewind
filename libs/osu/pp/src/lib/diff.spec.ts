import { readFileSync } from "fs";
import { buildBeatmap, OsuClassicMod, parseBlueprint } from "@rewind/osu/core";
import { calculateDifficultyAttributes } from "./diff";

function calc(name: string, mods: OsuClassicMod[] = []) {
  const data = readFileSync(name, "utf-8");
  const blueprint = parseBlueprint(data);

  const beatmap = buildBeatmap(blueprint, { mods });

  const attributes = calculateDifficultyAttributes(
    beatmap.hitObjects,
    beatmap.appliedMods,
    beatmap.difficulty.overallDifficulty,
  );

  return { beatmap, attributes };
}

describe("PP Test", function () {
  it("only hit circles", function () {
    // https://osu.ppy.sh/beatmapsets/1010865#osu/2115970
    // Violet perfume
    const file =
      "E:\\osu!\\Songs\\1010865 SHK - Violet Perfume [no video]\\SHK - Violet Perfume (ktgster) [Insane].osu";
    const expectedStarRating = 4.66;
    const { attributes, beatmap } = calc(file, []);
    expect(attributes.length).toEqual(beatmap.hitObjects.length);
    expect(attributes[attributes.length - 1].starRating).toBeCloseTo(expectedStarRating, 2);
  });

  it("with sliders", function () {
    // https://osu.ppy.sh/beatmapsets/863227#osu/1860433
    // 6.86 -> 6.34
    const file =
      "E:\\osu!\\Songs\\863227 Brian The Sun - Lonely Go! (TV Size) [no video]\\Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu";

    // Calculated with osu!lazer code -> interestingly this shows 6.34 on the website (rounded up)
    const expectedStarRating = 6.3331461484197025;
    const { attributes } = calc(file, []);
    expect(attributes[attributes.length - 1].starRating).toBeCloseTo(expectedStarRating, 5);
  });
});

// TODO: Use the ones from osu! "diffcalc-test.osu"
