import { Blueprint, buildBeatmap, OsuClassicMod, parseBlueprint } from "@osujs/core";
import { calculateDifficultyAttributes, calculatePerformanceAttributes } from "@osujs/pp";
import { osuTestData, translateModAcronym } from "../util";
import { readFileSync } from "fs";

// 3 is possible on maps that don't have extremely obscure sliders
const PP_EXPECTED_PRECISION = 2;

type TestCase = {
  mods: string[];
  combo: number;
  countGreat: number;
  countOk: number;
  countMeh: number;
  countMiss: number;
  totalPP: number;
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

function testItMan(
  blueprint: Blueprint,
  { mods: modAcronyms, totalPP: expectedPP, countMeh, countGreat, countOk, countMiss, combo }: TestCase,
) {
  const modAcronymsName = modAcronyms.length === 0 ? "NM" : modAcronyms.join(",");
  const testCaseName = `${modAcronymsName} ${combo}x ${[countGreat, countOk, countMeh, countMiss]} `;
  const mods = modAcronyms.map(translateModAcronym);
  it(testCaseName, function () {
    const finalAttributes = calculateStarRating(blueprint, mods);
    const { total } = calculatePerformanceAttributes(finalAttributes, {
      mods,
      countMeh,
      countMiss,
      countOk,
      maxCombo: combo,
      countGreat,
    });
    expect(total).toBeCloseTo(expectedPP, PP_EXPECTED_PRECISION);
  });
}
function runTestSuite({ filename, cases }: TestSuite) {
  describe(filename, function () {
    const data = readFileSync(osuTestData(`Songs/${filename}`), "utf-8");
    const blueprint = parseBlueprint(data);
    cases.forEach((c) => testItMan(blueprint, c));
  });
}

describe("PP calculation", function () {
  const data = readFileSync(osuTestData("out/pp/20220928.json"), "utf-8");
  const suites: TestSuite[] = JSON.parse(data);
  suites.forEach((testCase) => {
    runTestSuite(testCase);
  });
});

describe.skip("Just One", function () {
  const filename = "Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu";
  const data = readFileSync(osuTestData(`Songs/${filename}`), "utf-8");
  const blueprint = parseBlueprint(data);

  testItMan(blueprint, {
    mods: [],
    combo: 455,
    countGreat: 341,
    countOk: 10,
    countMeh: 0,
    countMiss: 1,
    totalPP: 211.23440779362528,
  });
});
