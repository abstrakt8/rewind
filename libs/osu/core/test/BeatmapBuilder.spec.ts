import { Position } from "@rewind/osu/math";
import { buildBeatmap, HitCircle, Slider } from "../src";
import { parseBlueprintFromFS, TEST_MAPS } from "./util.spec";

function assertPositionEqual(actual: Position, expected: Position, numDigits?: number) {
  expect(actual.x).toBeCloseTo(expected.x, numDigits);
  expect(actual.y).toBeCloseTo(expected.y, numDigits);
}

test("Simple short slider", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.ONE_SLIDER);
  const hitObjects = buildBeatmap(bluePrint, { addStacking: false, mods: [] }).hitObjects;

  // Only one slider is built
  expect(hitObjects.length).toBe(1);

  const slider = hitObjects[0] as Slider;
  // console.log(slider.path.controlPoints.map((p) => p.offset));

  // Actual positions, not offsets
  assertPositionEqual(slider.ballPositionAt(0), { x: 287, y: 147 });
  assertPositionEqual(slider.ballPositionAt(0.5), { x: 242.49834839505502, y: 141.5880078631909 });
  assertPositionEqual(slider.ballPositionAt(1.0), { x: 198.4392805888815, y: 149.81550051795287 });

  // Only legacy last tick
  expect(slider.checkPoints.length).toBe(1);

  // End time = 1918
  expect(slider.endTime).toBeCloseTo(1918.375, 2);
  // This was tested against osu!lazer version
  expect(slider.checkPoints[0].hitTime).toBeCloseTo(1882.375, 2);
});

test("Simple slider with repeat", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SLIDER_WITH_ONE_REPEAT);
  const beatmap = buildBeatmap(bluePrint, { addStacking: false });
  const hitObject = beatmap.hitObjects[0];
  expect(hitObject).toBeInstanceOf(Slider);
  const slider = hitObject as Slider;
  expect(slider.repeatCount).toBe(1);
  expect(slider.checkPoints.length).toBe(2);
  expect(slider.checkPoints[0].type).toBe("REPEAT");
  expect(slider.checkPoints[1].type).toBe("LAST_LEGACY_TICK");
});

test("Short kick slider", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SHORT_KICK_SLIDER);
  const beatmap = buildBeatmap(bluePrint, { addStacking: false });

  const kickSlider = beatmap.hitObjects[0] as Slider;

  // KickSlider time interval : [1684,1715.25]
  expect(kickSlider.startTime).toBeCloseTo(1684);
  expect(kickSlider.endTime).toBeCloseTo(1715.25);

  expect(kickSlider.repeatCount).toBe(0);
  expect(kickSlider.checkPoints.length).toBe(1);
  expect(kickSlider.checkPoints[0].type).toBe("LAST_LEGACY_TICK");

  // The span time interval is shorter than 34ms. Here the legacy last tick is in the center of the time interval.
  expect(kickSlider.checkPoints[0].hitTime).toBeCloseTo(1699.625, 2);
});

describe("Violet Perfume / Map with only HitCircles", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.VIOLET_PERFUME);
  const beatmap = buildBeatmap(bluePrint);
  // This map only consists of hit circles
  const hitCircles = beatmap.hitObjects as HitCircle[];
  it("should build correctly", function () {
    expect(beatmap).toBeDefined();
  });
  it("should assign combo indexes correctly", function () {
    expect(hitCircles[0].comboSetIndex).toBe(0);
    expect(hitCircles[0].withinComboSetIndex).toBe(0);

    expect(hitCircles[1].comboSetIndex).toBe(0);
    expect(hitCircles[1].withinComboSetIndex).toBe(1);

    expect(hitCircles[4].comboSetIndex).toBe(1);
    expect(hitCircles[4].withinComboSetIndex).toBe(0);
  });
  it("should apply stacking correctly", function () {
    // They are stacked at position (312, 250) -> see Blueprint of this map
    expect(hitCircles[7].position).not.toEqual(hitCircles[8].position);
    expect(hitCircles[8].position).not.toEqual(hitCircles[9].position);
  });
});

describe("Gera Gera / Tech map", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.GERA_GERA);
  const beatmap = buildBeatmap(bluePrint, { addStacking: false });
  it("should build correctly", function () {
    expect(beatmap).toBeDefined();
  });
  it("should assign combo index correctly", function () {
    for (const h of beatmap.hitObjects) {
      if (h instanceof Slider) {
        expect(h.head.comboSetIndex).not.toBeNaN();
        // console.log(`${h.head.comboSetIndex}/${h.head.withinComboSetIndex}`);
      }
    }
  });
});
