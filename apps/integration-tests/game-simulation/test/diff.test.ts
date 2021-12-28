import { Blueprint, buildBeatmap, OsuClassicMod } from "@osujs/core";
import { readFileSync } from "fs";
import { getBlueprintFromTestDir, translateModAcronym } from "../src/app/util";
import { calculateDifficultyAttributes } from "@osujs/pp";

// 3 digits after floating point
const SR_EXPECTED_PRECISION = 3;

type TestCase = {
  mods: OsuClassicMod[];
  starRating: number;
};

interface TestSuite {
  filename: string;
  cases: Array<TestCase>;
}

// Mods that actually change the hit objects in some way
// * HR, EZ

function calculateStarRating(blueprint: Blueprint, mods: OsuClassicMod[] = []) {
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

function runTestSuite({ filename, cases }: TestSuite) {
  describe(filename, function () {
    // const blueprint = getBlueprintFromTestDir(filename);
    cases.forEach(({ mods: modAcronyms, starRating }) => {
      const testCaseName = modAcronyms.length === 0 ? "NM" : modAcronyms.join(",");
      const mods = modAcronyms.map(translateModAcronym);
      it(testCaseName, function () {
        const blueprint = getBlueprintFromTestDir(filename);
        const actual = calculateStarRating(blueprint, mods);
        expect(actual).toBeCloseTo(starRating, SR_EXPECTED_PRECISION);
      });
    });
  });
}

describe("Star rating calculation", function () {
  const data = readFileSync("E:\\test.json", "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach(runTestSuite);
});
