import { Position } from "@rewind/osu/math";
import { parseOsuHitObjectSetting } from "./BlueprintParser";
import { HitCircleSettings, HitObjectSettingsType, SliderSettings, SpinnerSettings } from "./HitObjectSettings";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";
import { PathType } from "../hitobjects/slider/PathType";

function mapToOffsets(controlPoints: PathControlPoint[]): Position[] {
  return controlPoints.map((p) => p.offset);
}

/**
 * Unit testing the parseOsuHitObjectSetting
 */
describe("parseOsuHitObjectSetting", function () {
  it("Simple HitCircle", function () {
    const settings = parseOsuHitObjectSetting("256,192,11000,21,2") as HitCircleSettings;
    expect(settings.type).toBe("HIT_CIRCLE");
    expect(settings.position.x).toBe(256);
    expect(settings.position.y).toBe(192);
    expect(settings.time).toBe(11000);
    expect(settings.newCombo).toBe(true);
    expect(settings.comboSkip).toBe(1);
    // TODO: Sample
  });

  it("Slider with Bezier type", function () {
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
    expect(settings.pathPoints[0].type).toBe(PathType.Bezier);
    // expect(settings.pathPoints[1].type).to.be.undefined;
    // expect(settings.pathPoints[2].type).to.be.undefined; // Bezier ???
    // expect(settings.pathPoints[3].type).to.be.undefined;
    // TODO: Sample
  });
  it("Slider with Centripetal Catmull–Rom type", function () {
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
  it("Spinner", function () {
    // Spinner from https://osu.ppy.sh/beatmapsets/803535#osu/1686476
    const settings = parseOsuHitObjectSetting("256,192,10892,12,0,21460,0:0:0:0:");
    expect(settings.type).toBe("SPINNER");

    const spinnerSettings = settings as SpinnerSettings;
    expect(spinnerSettings.position).toStrictEqual({ x: 256, y: 192 });
    expect(spinnerSettings.time).toBe(10892);
    expect(spinnerSettings.duration).toBe(21460 - 10892);
  });
});
