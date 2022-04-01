import { getBlueprintFromTestDir } from "./util";
import { buildBeatmap, mostCommonBeatLength } from "@osujs/core";
import { beatLengthToBPM } from "@osujs/math";

const EXPECTED_PRECISION = 3;

describe("Most common BPM calculation", function () {
  it("Akatsuki Zukuyo 180BPM", function () {
    const blueprint = getBlueprintFromTestDir(
      "351280 HoneyWorks - Akatsuki Zukuyo/HoneyWorks - Akatsuki Zukuyo ([C u r i]) [Taeyang's Extra].osu",
    );
    const beatmap = buildBeatmap(blueprint);
    expect(
      beatLengthToBPM(
        mostCommonBeatLength({
          hitObjects: beatmap.hitObjects,
          timingPoints: blueprint.controlPointInfo.timingPoints.list,
        }) as number,
      ),
    ).toBeCloseTo(180, EXPECTED_PRECISION);
  });
  it("The Unforgiving 134BPM (Range 70-200)", function () {
    const blueprint = getBlueprintFromTestDir(
      "29157 Within Temptation - The Unforgiving [no video]/Within Temptation - The Unforgiving (Armin) [Marathon].osu",
    );
    const beatmap = buildBeatmap(blueprint);
    expect(
      beatLengthToBPM(
        mostCommonBeatLength({
          hitObjects: beatmap.hitObjects,
          timingPoints: blueprint.controlPointInfo.timingPoints.list,
        }) as number,
      ),
    ).toBeCloseTo(134, EXPECTED_PRECISION);
  });
});
