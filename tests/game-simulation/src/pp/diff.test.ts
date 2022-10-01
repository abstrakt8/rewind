import { Blueprint, buildBeatmap, OsuClassicMod, parseBlueprint } from "@osujs/core";
import { calculateDifficultyAttributes } from "@osujs/pp";
import { osuTestData, translateModAcronym } from "../util";

import { toMatchObjectCloseTo } from "jest-match-object-close-to";
import { readFileSync } from "fs";

expect.extend({ toMatchObjectCloseTo });

/**
 * Tests the SR calculations against the ones generated from the osu!lazer source code (2021-11-14 version).
 */

// n digits after floating point
const SR_EXPECTED_PRECISION = 3;

type TestCase = {
  mods: string[];
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
  describe(filename, function () {
    let blueprint;
    beforeEach(() => {
      const data = readFileSync(osuTestData(`Songs/${filename}`), "utf-8");
      blueprint = parseBlueprint(data);
    });
    cases.forEach(({ mods: modAcronyms, starRating, speedRating, aimRating, flashlightRating }) => {
      const testCaseName = modAcronyms.length === 0 ? "NM" : modAcronyms.join(",");
      const mods = modAcronyms.map(translateModAcronym);
      it(testCaseName, function () {
        const actual = calculateStarRating(blueprint, mods);
        expect({
          aimRating: actual.aimDifficulty,
          speedRating: actual.speedDifficulty,
          // Test FL with different delta
          flashlightRating: actual.flashlightDifficulty,
          starRating: actual.starRating,
        }).toMatchObjectCloseTo(
          {
            aimRating,
            flashlightRating,
            speedRating,
            starRating,
          },
          SR_EXPECTED_PRECISION,
        );
      });
    });
  });
}

describe("Star rating calculation", function () {
  const data = readFileSync(osuTestData("out/sr/20220928.json"), "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach((testCase) => {
    runTestSuite(testCase);
  });
});

// Change `describe.skip` -> `describe.only` to test a specific one.
describe.skip("SR a specific one", function () {
  const testSuite: TestSuite = {
    filename: "SHK - Violet Perfume (ktgster) [Insane].osu",
    cases: [
      {
        mods: ["FL"],
        starRating: 5.348894637413558,
        aimRating: 2.285155242240623,
        speedRating: 2.217866076410721,
        flashlightRating: 1.3626073031248354,
      },
    ],
  };
  runTestSuite(testSuite);
});
