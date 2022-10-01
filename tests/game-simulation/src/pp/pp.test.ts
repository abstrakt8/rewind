import { Blueprint, buildBeatmap, OsuClassicMod, parseBlueprint } from "@osujs/core";
import { calculateDifficultyAttributes, calculatePerformanceAttributes } from "@osujs/pp";
import { osuTestData, translateModAcronym } from "../util";
import { readFileSync } from "fs";

const PP_EXPECTED_PRECISION = 3;

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
    // let blueprint;
    // beforeAll(() => {
    // });
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

// TODO: Use the ones from osu! Lazer testcases: one is called "diffcalc-test.osu"
// describe("Lonely Go!", function () {
//   const blueprint = getBlueprintFromTestDir(
//     "863227 Brian The Sun - Lonely Go! (TV Size) [no video]/Brian The Sun - Lonely Go! (TV Size) (Nevo) [Fiery's Extreme].osu",
//   );
//   // https://osu.ppy.sh/scores/osu/3160935737/
//   it("Scores", function () {
//     expect(
//       calculatePP(blueprint, {
//         mods: ["HARD_ROCK", "HIDDEN"],
//         maxCombo: 569,
//         countGreat: 352,
//         countOk: 0,
//         countMeh: 0,
//         countMiss: 0,
//       }),
//     ).toBeCloseTo(435.556, 3);
//   });
// });
// describe("Hidamari no Uta", function () {
//   const blueprint = getBlueprintFromTestDir(
//     "931596 Apol - Hidamari no Uta/Apol - Hidamari no Uta (-Keitaro) [Expert].osu",
//   );
//   // https://osu.ppy.sh/scores/osu/2863181831/
//   it("double tapping punishment", function () {
//     const counts = [908, 46, 40, 0];
//     const [countGreat, countOk, countMeh, countMiss] = counts;
//     expect(
//       calculatePP(blueprint, {
//         mods: ["DOUBLE_TIME", "HIDDEN"],
//         maxCombo: 1484,
//         countGreat,
//         countOk,
//         countMeh,
//         countMiss,
//       }),
//     ).toBeCloseTo(349.171, 2);
//   });
// });
