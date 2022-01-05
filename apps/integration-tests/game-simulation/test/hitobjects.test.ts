// Testing the generation of beatmaps etc.


import { readFileSync } from "fs";
import { Position } from "@osujs/math";
import { getBlueprintFromTestDir } from "../src/app/util";
import { buildBeatmap, Slider } from "@osujs/core";
import { toMatchObjectCloseTo } from "jest-match-object-close-to";

expect.extend({ toMatchObjectCloseTo });

interface Testsuite {
  filename: string;
  sliders: Array<{
    index: number;
    duration: number;
    checkPoints: Array<{
      type: "TICK" | "REPEAT" | "LAST_LEGACY_TIC",
      time: number;
      position: Position;
    }>;
  }>;
}


// 7182 / 9552 for precision = 9
// 7125 / 9552 for precision = 11
// 7124 / 9552 for precision = 12
// 7124 / 9552 for precision = 12
const expectedPrecision = 4;
// 384,307,21685,2,0,B|399:292|399:274|399:274|403:295|388:308,1,75.0000028610231,2|0,0:0|0:0,0:0:0:0:
// 312,230,38626,2,0,P|306:266|323:298,1,75.0000028610231,2|0,1:2|0:0,0:0:0:0:

function runTestSuite({ filename, sliders }: Testsuite) {
  describe(filename, function() {
    const blueprint = getBlueprintFromTestDir(filename);
    const beatmap = buildBeatmap(blueprint, { mods: [] });
    describe("Sliders", function() {
      sliders.forEach(lazerSlider => {
        describe(lazerSlider.index, function() {
          const slider = beatmap.hitObjects[lazerSlider.index] as Slider;
          it("number of checkpoints", function() {
            expect(slider.checkPoints.length).toBe(lazerSlider.checkPoints.length);
          });
          for (let i = 0; i < slider.checkPoints.length; i++) {
            const actual = slider.checkPoints[i];
            const expected = lazerSlider.checkPoints[i];
            // (89.66166, -7.796666)
            describe(`Checkpoint ${i}`, function() {
              it("type", function() {
                expect(actual.type).toBe(expected.type);
              });
              it("time", function() {
                expect(actual.hitTime).toBeCloseTo(expected.time, expectedPrecision);
              });
              it("position", function() {
                expect(actual.position).toMatchObjectCloseTo(expected.position, expectedPrecision);
              });
            });
          }
        });
      });

    });
  });
}

describe("hitobjects", function() {
  const data = readFileSync("E:\\hitobjects.json", "utf-8");
  const json = JSON.parse(data) as Testsuite[];
  json.forEach(runTestSuite);
});
