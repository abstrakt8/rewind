import { Blueprint, buildBeatmap, OsuClassicMod } from "@osujs/core";
import { readFileSync } from "fs";
import { getBlueprintFromTestDir, translateModAcronym } from "../src/app/util";
import { calculateDifficultyAttributes } from "@osujs/pp";

import { toMatchObjectCloseTo } from "jest-match-object-close-to";

expect.extend({ toMatchObjectCloseTo });

// n digits after floating point
const SR_EXPECTED_PRECISION = 3;

type TestCase = {
  mods: OsuClassicMod[];
  starRating: number;

  aimRating: number;
  speedRating: number;
  flashlightRating: number;
};

interface TestSuite {
  filename: string;
  cases: Array<TestCase>;
}

// Mods that actually change the hit objects in some way
// * HR, EZ

function calculateStarRating(blueprint: Blueprint, mods: OsuClassicMod[] = []) {
  const beatmap = buildBeatmap(blueprint, { mods });
  const [lastAttributes] = calculateDifficultyAttributes(beatmap, true);
  return lastAttributes;
}

function runTestSuite({ filename, cases }: TestSuite) {
  describe(filename, function() {
    cases.forEach(({
                     mods: modAcronyms,
                     starRating,
                     speedRating,
                     aimRating,
                     flashlightRating,
                   }) => {
      const blueprint = getBlueprintFromTestDir(filename);
      const testCaseName = modAcronyms.length === 0 ? "NM" : modAcronyms.join(",");
      const mods = modAcronyms.map(translateModAcronym);
      it(testCaseName, function() {
        const actual = calculateStarRating(blueprint, mods);
        expect({
          aimRating: actual.aimDifficulty,
          speedRating: actual.speedDifficulty,
          // Test FL with different delta
          // flashlightRating: actual.flashlightDifficulty,
          starRating: actual.starRating,
        }).toMatchObjectCloseTo({
          aimRating,
          // flashlightRating,
          speedRating,
          starRating,
        }, SR_EXPECTED_PRECISION);
      });
    });
  });
}

describe("Star rating calculation", function() {
  const data = readFileSync("E:\\test.json", "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach(runTestSuite);
});

describe("Katagiri", function() {
  // const data = readFileSync("E:\\fl.json", "utf-8");
  const data = readFileSync("E:\\katagiri.json", "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach(runTestSuite);
});
