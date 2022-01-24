import { Vec2 } from "@osujs/math";
import { PathApproximator } from "../src/hitobjects/slider/PathApproximator";
import { buildBeatmap, parseBlueprint } from "../src";
import { assertPositionEqual } from "./utils/asserts";

/**
 * 0 = Vector2 {x: -109,
y: -7}
 1 = Vector2 {x: -78,
y: 12}
 *
 * */

describe("PathApproximator", function () {
  describe("bezier", function () {
    it("[ (-109,-7), [-78, 12] ] should return good", function () {
      const p = [new Vec2(-109, -7), new Vec2(-78, 12)];
      const q = PathApproximator.approximateBezier(p);

      // p shoudl be equal to q (tested against osu-framework)
    });
  });
});

test("Aether Realm One Perfect Curve Slider", () => {
  // Aether Realm The Sun The Moon The Star by ItsWinter
  // At position 14:36.377 there is a very tricky slider
  const data = `
osu file format v14

[General]
StackLeniency: 0.6
[Difficulty]
HPDrainRate:5
CircleSize:4.2
OverallDifficulty:9.5
ApproachRate:9.8
SliderMultiplier:1.6
SliderTickRate:1
[TimingPoints]
826485,285.714285714286,3,3,1,60,1,0
876199,-100,3,3,1,65,0,1
[HitObjects]
196,210,876199,2,0,P|256:227|342:197,1,120`;
  const blueprint = parseBlueprint(data);
  const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: [] });
  const slider = beatmap.getSlider("0");

  expect(slider.checkPoints.length).toEqual(1);

  const tick = slider.checkPoints[0];

  const progress = (tick.hitTime - slider.startTime) / slider.duration;
  // console.log("tick.hitTime", tick.hitTime);
  // console.log("progress: ", progress);
  const tickPosition = slider.ballPositionAt(progress);

  console.log(tickPosition);
  // TODO: When using floats in Vec2 this will match up to 5 digits which we shoudl also use here.
  assertPositionEqual(tickPosition, { x: 292.47076, y: 222.67848 }, 4);
  // Expected (292.47076, 222.67848)
});
