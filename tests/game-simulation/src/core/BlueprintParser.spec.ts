import { parseBlueprintFromFS } from "../others";
import { SliderSettings } from "@osujs/core";
import { TEST_MAPS } from "../util";

describe("Parsing one slider", function () {
  it("should parse the one slider correctly", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.ONE_SLIDER);
    expect(bluePrint.hitObjectSettings.length).toBe(1);
  });
});

describe("Parsing one slider with repeat", function () {
  it("should parse the one slider with repeat correctly", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.SLIDER_WITH_ONE_REPEAT);
    expect(bluePrint.hitObjectSettings.length).toBe(1);
    const sliderSetting = bluePrint.hitObjectSettings[0] as SliderSettings;
    expect(sliderSetting.repeatCount).toBe(1);
  });
});

//
describe("Parsing kick slider", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SHORT_KICK_SLIDER);
  // TODO: Make a better version of this test because previously there was no flush pending points
  it("should parse the control points correctly", function () {
    expect(bluePrint.controlPointInfo.timingPoints.length).toBe(1);
  });
});

test("Parsing TSTMTS", function () {
  // ~250ms parsing
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SUN_MOON_STAR);
  const numberOfHitObjects = bluePrint.hitObjectSettings.length;
  expect(numberOfHitObjects).toBe(6953);
});
