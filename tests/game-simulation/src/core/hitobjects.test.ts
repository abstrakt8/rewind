import { readFileSync } from "fs";
import { Position } from "@osujs/math";
import { getBlueprintFromTestDir, osuTestData } from "../util";
import { buildBeatmap, Slider } from "@osujs/core";
import { toMatchObjectCloseTo } from "jest-match-object-close-to";

expect.extend({ toMatchObjectCloseTo });

/**
 * Tests the generation of the hitobjects against osu!lazer
 *
 * The test case files are generated with https://github.com/abstrakt8/osu
 */

interface Testsuite {
  filename: string;
  sliders: Array<{
    index: number;
    duration: number;
    checkPoints: Array<{
      type: "TICK" | "REPEAT" | "LAST_LEGACY_TICK";
      time: number;
      position: Position;
    }>;
  }>;
}

// TODO: Try to get a precision of 4
const expectedPrecision = 3;

function runTestSuite({ filename, sliders }: Testsuite) {
  describe(filename, function () {
    const blueprint = getBlueprintFromTestDir(filename);
    const beatmap = buildBeatmap(blueprint, { mods: [] });
    describe("Sliders", function () {
      sliders.forEach((lazerSlider) => {
        describe(lazerSlider.index, function () {
          const slider = beatmap.hitObjects[lazerSlider.index] as Slider;
          it("number of checkpoints", function () {
            expect(slider.checkPoints.length).toBe(lazerSlider.checkPoints.length);
          });
          for (let i = 0; i < slider.checkPoints.length; i++) {
            const actual = slider.checkPoints[i];
            const expected = lazerSlider.checkPoints[i];
            describe(`Checkpoint ${i}`, function () {
              it("type", function () {
                expect(actual.type).toBe(expected.type);
              });
              it("time", function () {
                expect(actual.hitTime).toBeCloseTo(expected.time, expectedPrecision);
              });
              it.only("position", function () {
                expect(actual.position).toMatchObjectCloseTo(expected.position, expectedPrecision);
              });
            });
          }
        });
      });
    });
  });
}

describe("HitObjects generation", function () {
  const data = readFileSync(osuTestData("out/hitobjects.json"), "utf-8");
  const json = JSON.parse(data) as Testsuite[];
  json.forEach(runTestSuite);
});
