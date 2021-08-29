import {
  HitCircleSettings,
  HitObjectSettingsType,
  parseOsuHitObjectSetting,
  PathControlPoint,
  PathType,
  SliderSettings,
  SpinnerSettings,
} from "../src";
import { parseBlueprintFromFS } from "./utils/others";
import { Position } from "@rewind/osu/math";
import { TEST_MAPS } from "./utils/testBlueprintPath";

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
      console.log(bm.defaultDifficulty);
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

function mapToOffsets(controlPoints: PathControlPoint[]): Position[] {
  return controlPoints.map((p) => p.offset);
}

describe("HitObjectSettingsParsing", function () {
  describe("HitCircle - Simple", function () {
    const settings = parseOsuHitObjectSetting("256,192,11000,21,2") as HitCircleSettings;
    it("should parse correctly", function () {
      expect(settings.type).toBe("HIT_CIRCLE");
      expect(settings.position.x).toBe(256);
      expect(settings.position.y).toBe(192);
      expect(settings.time).toBe(11000);
      expect(settings.newCombo).toBe(true);
      expect(settings.comboSkip).toBe(1);
      // TODO: Sample
    });
  });

  describe("Slider, Bezier, Simple", function () {
    it("should parse correctly", function () {
      const settings = parseOsuHitObjectSetting(
        "100,101,12600,6,1,B|200:200|250:200|250:200|300:150,2,310.123,2|1|2,0:0|0:0|0:2,0:0:0:0:",
      ) as SliderSettings;
      expect(settings.type).toBe("SLIDER");
      expect(settings.position.x).toBe(100);
      expect(settings.position.y).toBe(101);
      expect(settings.time).toBe(12600);
      expect(settings.newCombo).toBe(true);
      expect(settings.comboSkip).toBe(0);
      expect(mapToOffsets(settings.pathPoints)).toEqual([
        { x: 0, y: 0 },
        { x: 100, y: 99 },
        { x: 150, y: 99 },
        { x: 200, y: 49 },
      ]);
      console.log(settings.pathPoints);
      expect(settings.pathPoints[0].type).toBe(PathType.Bezier);
      // expect(settings.pathPoints[1].type).to.be.undefined;
      // expect(settings.pathPoints[2].type).to.be.undefined; // Bezier ???
      // expect(settings.pathPoints[3].type).to.be.undefined;
      // TODO: Sample
    });
  });
  describe("Slider, Centripetal catmull-rom", function () {
    it("should parse correctly", function () {
      const settings = parseOsuHitObjectSetting(
        "100,-101,12600,6,1,C|200:200|300:412,2,310.123,2|1|2,0:0|0:0|0:2,0:0:0:0:",
      ) as SliderSettings;
      const expectedType: HitObjectSettingsType = "SLIDER";
      expect(settings.type).toBe(expectedType);
      expect(settings.position.x).toBe(100);
      expect(settings.position.y).toBe(-101);
      expect(settings.time).toBe(12600);
      expect(settings.newCombo).toBe(true);
      expect(settings.comboSkip).toBe(0);
      // expect(settings.pathPoints).to.be.deep.equal([{x: 200, y: 200}, {x: 300, y: 412}]);
      // TODO: Sample
    });
  });
});

test("Parsing Spinner - Paranoid Lost - Beginning", function () {
  const settings = parseOsuHitObjectSetting("256,192,10892,12,0,21460,0:0:0:0:");
  expect(settings.type).toBe("SPINNER");

  const spinnerSettings = settings as SpinnerSettings;
  expect(spinnerSettings.position).toStrictEqual({ x: 256, y: 192 });
  expect(spinnerSettings.time).toBe(10892);
  expect(spinnerSettings.duration).toBe(21460 - 10892);
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
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SUN_MOON_STAR);
  const numberOfHitObjects = bluePrint.hitObjectSettings.length;
  expect(numberOfHitObjects).toBeGreaterThan(0);
  // ~250ms parsing
  console.log("Sun Moon Star hitobjects: " + numberOfHitObjects);
});
