import { parseBlueprintFromFS } from "./utils/others";
import { TEST_MAPS } from "./utils/testBlueprintPath";
import { SliderSettings } from "../src/blueprint/HitObjectSettings";

describe("Test *.osu blue print parsing", function () {
  describe("Map: ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu", function () {
    const bm = parseBlueprintFromFS(TEST_MAPS.GERA_GERA);
    // console.log(bm);
    it("should parse the meta data correctly", function () {
      expect(bm.blueprintInfo.metadata).toEqual(
        expect.objectContaining({
          artist: "ZUTOMAYO",
          artistUnicode: "ずっと真夜中でいいのに。",
          title: "Kan Saete Kuyashiiwa",
          titleUnicode: "勘冴えて悔しいわ",
          tags: "zutto mayonaka de ii no ni. acane sukinathan scubdomino luscent 404_aimnotfound",
          audioFile: "audio.mp3",
          // previewTime: 0
        }),
      );
    });
    it("should parse the beatmap version correctly", function () {
      expect(bm.blueprintInfo.beatmapVersion).toBe(14);
    });
    it("should read some hit objects", function () {
      expect(bm.hitObjectSettings).toBeTruthy();
    });
    it("should parse blueprint default difficulty correctly", function () {
      const bm = parseBlueprintFromFS(TEST_MAPS.GERA_GERA);
      expect(bm.defaultDifficulty).toEqual({
        drainRate: 5,
        circleSize: 4,
        overallDifficulty: 9,
        approachRate: 9.6,
        sliderMultiplier: 1.8,
        sliderTickRate: 1,
      });
    });

    it("should have the timing control points ordered non-decreasingly by start time", function () {
      const { timingPoints } = bm.controlPointInfo;
      for (let i = 0; i + 1 < timingPoints.length; i++) {
        const a = timingPoints.get(i);
        const b = timingPoints.get(i + 1);
        expect(a.time <= b.time).toBeTruthy();
        //  `Not ordered properly at i=${i}: ${a.time} <= ${b.time}`
      }
    });
  });
});

describe("Parsing one slider", function () {
  it("should parse the one slider correctly", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.ONE_SLIDER);
    expect(bluePrint.hitObjectSettings.length).toBe(1);
    console.log(bluePrint.hitObjectSettings[0]);
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
    console.log(bluePrint.controlPointInfo.timingPoints);
    expect(bluePrint.controlPointInfo.timingPoints.length).toBe(1);
  });
});

test("Parsing TSTMTS", function () {
  // ~250ms parsing
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SUN_MOON_STAR);
  const numberOfHitObjects = bluePrint.hitObjectSettings.length;
  expect(numberOfHitObjects).toBe(6953);
});
