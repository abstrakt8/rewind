import { Blueprint, buildBeatmap, OsuClassicMod } from "@osujs/core";
import { calculateDifficultyAttributes } from "@osujs/pp";
import { getBlueprintFromTestDir, resourcesPath, translateModAcronym } from "./util";

import { toMatchObjectCloseTo } from "jest-match-object-close-to";
import { readFileSync } from "fs";

expect.extend({ toMatchObjectCloseTo });

/**
 * Tests the SR calculations against the ones generated from the osu!lazer source code (2021-11-14 version).
 */

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

function calculateStarRating(blueprint: Blueprint, mods: OsuClassicMod[] = []) {
  const beatmap = buildBeatmap(blueprint, { mods });
  const [lastAttributes] = calculateDifficultyAttributes(beatmap, true);
  return lastAttributes;
}

function runTestSuite({ filename, cases }: TestSuite) {
  describe(filename, function() {
    let blueprint;
    beforeEach(() => {
      blueprint = getBlueprintFromTestDir(filename);
    });
    cases.forEach(({
                     mods: modAcronyms,
                     starRating,
                     speedRating,
                     aimRating,
                     flashlightRating,
                   }) => {
      const testCaseName = modAcronyms.length === 0 ? "NM" : modAcronyms.join(",");
      const mods = modAcronyms.map(translateModAcronym);
      it(testCaseName, function() {
        const actual = calculateStarRating(blueprint, mods);
        expect({
          aimRating: actual.aimDifficulty,
          speedRating: actual.speedDifficulty,
          // Test FL with different delta
          flashlightRating: actual.flashlightDifficulty,
          starRating: actual.starRating,
        }).toMatchObjectCloseTo({
          aimRating,
          flashlightRating,
          speedRating,
          starRating,
        }, SR_EXPECTED_PRECISION);
      });
    });
  });
}

describe("Star rating calculation", function() {
  const data = readFileSync(resourcesPath("star_ratings.json"), "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach(testCase => {
    runTestSuite(testCase);
  });
});

// Change `describe.skip` -> `describe.only` to test a specific one.
describe.skip("SR a specific one", function() {
  const testSuite: TestSuite = {
    filename: "1357624 sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix)/sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix) (Nathan) [KEMOMIMI EDM SQUAD].osu",
    "cases": [
      {
        "mods": [],
        "starRating": 7.585806851390463,
        "aimRating": 3.962396149332689,
        "speedRating": 3.2644585786342555,
        "flashlightRating": 4.722278664838489,
      }],
  };
  runTestSuite(testSuite);
});
