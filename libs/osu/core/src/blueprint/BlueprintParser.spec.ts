import { Position } from "@osujs/math";
import { parseBlueprint, parseOsuHitObjectSetting } from "./BlueprintParser";
import { HitCircleSettings, HitObjectSettingsType, SliderSettings, SpinnerSettings } from "./HitObjectSettings";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";
import { PathType } from "../hitobjects/slider/PathType";
import { BeatmapDifficulty } from "../beatmap/BeatmapDifficulty";

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

describe("Parsing beatmap difficulty", function () {
  it("with missing approach rate", function () {
    // From "Banned Forever" https://osu.ppy.sh/beatmapsets/16349#osu/64266
    const data = `
osu file format v7
[Difficulty]
HPDrainRate:6
CircleSize:5
OverallDifficulty:8
SliderMultiplier:1.6
SliderTickRate:1
`;
    const { defaultDifficulty } = parseBlueprint(data, { sectionsToRead: ["Difficulty"] });
    expect(defaultDifficulty).toEqual<BeatmapDifficulty>({
      drainRate: 6,
      circleSize: 5,
      overallDifficulty: 8,
      // It takes the OD value, source:
      // https://github.com/ppy/osu/blob/b1fcb840a9ff4d866aac262ace7f54fa88b5e0ce/osu.Game/Beatmaps/BeatmapDifficulty.cs#L35
      approachRate: 8,
      sliderMultiplier: 1.6,
      sliderTickRate: 1,
    });
  });
  it("with missing OD and AR", function () {
    // OD is by default 5, so the AR should be 5 as well
    const data = `
osu file format v7
[Difficulty]
HPDrainRate:6
CircleSize:5
// OverallDifficulty:8
SliderMultiplier:1.6
SliderTickRate:1
`;
    const { defaultDifficulty } = parseBlueprint(data, { sectionsToRead: ["Difficulty"] });
    expect(defaultDifficulty).toEqual<BeatmapDifficulty>({
      drainRate: 6,
      circleSize: 5,
      overallDifficulty: 5,
      // It takes the OD value, source:
      // https://github.com/ppy/osu/blob/b1fcb840a9ff4d866aac262ace7f54fa88b5e0ce/osu.Game/Beatmaps/BeatmapDifficulty.cs#L35
      approachRate: 5,
      sliderMultiplier: 1.6,
      sliderTickRate: 1,
    });
  });
});

describe("Parsing a well formatted .osu file: ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu", function () {
  const data = `osu file format v14
[General]
AudioFilename: audio.mp3
AudioLeadIn: 0
PreviewTime: 69709
Countdown: 0
SampleSet: Soft
StackLeniency: 0.7
Mode: 0
LetterboxInBreaks: 0
WidescreenStoryboard: 0

[Editor]
DistanceSpacing: 0.3
BeatDivisor: 4
GridSize: 8
TimelineZoom: 1.9

[Metadata]
Title:Kan Saete Kuyashiiwa
TitleUnicode:勘冴えて悔しいわ
Artist:ZUTOMAYO
ArtistUnicode:ずっと真夜中でいいのに。
Creator:Nathan
Version:geragera
Source:
Tags:zutto mayonaka de ii no ni. acane sukinathan scubdomino luscent 404_aimnotfound
BeatmapID:2096523
BeatmapSetID:1001507

[Difficulty]
HPDrainRate:5
CircleSize:4
OverallDifficulty:9
ApproachRate:9.6
SliderMultiplier:1.8
SliderTickRate:1

[Events]
//Background and Video events
0,0,"thistook3yearstoresize.png",0,0
//Break Periods
2,98517,103577
2,181510,183385
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Layer 4 (Overlay)
//Storyboard Sound Samples

[TimingPoints]
309,400,4,2,1,80,1,0
509,400,4,2,1,80,1,0
909,-76.9230769230769,4,2,1,80,0,0
// Rest are omitted

[Colours]
Combo1 : 255,94,55
Combo2 : 173,255,95
Combo3 : 17,254,176
Combo4 : 255,88,100

[HitObjects]
340,221,309,6,0,P|337:205|333:191,3,22.5,2|2|2|2,0:0|0:0|0:0|0:0,0:0:0:0:
342,239,509,5,6,3:2:0:0:
// Rest are omitted
`;
  const bp = parseBlueprint(data);
  it("should parse the meta data correctly", function () {
    expect(bp.blueprintInfo.metadata).toEqual(
      expect.objectContaining({
        artist: "ZUTOMAYO",
        artistUnicode: "ずっと真夜中でいいのに。",
        title: "Kan Saete Kuyashiiwa",
        titleUnicode: "勘冴えて悔しいわ",
        tags: "zutto mayonaka de ii no ni. acane sukinathan scubdomino luscent 404_aimnotfound",
        audioFile: "audio.mp3",
        // TODO: previewTime: 69709
      }),
    );
  });
  it("should parse the beatmap version correctly", function () {
    expect(bp.blueprintInfo.beatmapVersion).toBe(14);
  });
  it("should read some hit objects", function () {
    expect(bp.hitObjectSettings.length).toEqual(2);
  });
  it("should parse blueprint default difficulty correctly", function () {
    expect(bp.defaultDifficulty).toEqual({
      drainRate: 5,
      circleSize: 4,
      overallDifficulty: 9,
      approachRate: 9.6,
      sliderMultiplier: 1.8,
      sliderTickRate: 1,
    });
  });

  it("should have the timing control points ordered non-decreasingly by start time", function () {
    const { timingPoints } = bp.controlPointInfo;
    for (let i = 0; i + 1 < timingPoints.length; i++) {
      const a = timingPoints.get(i);
      const b = timingPoints.get(i + 1);
      expect(a.time <= b.time).toBeTruthy();
      //  `Not ordered properly at i=${i}: ${a.time} <= ${b.time}`
    }
  });
});
