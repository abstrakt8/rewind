import { Vec2 } from "@rewind/osu/math";
import { PathApproximator } from "../src/hitobjects/slider/PathApproximator";

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

test("PerfectCurve", () => {
  const points = [
    { x: 256, y: 227 },
    { x: 342, y: 197 },
  ];
  const l = PathApproximator.approximateCircularArc(points.map((p) => new Vec2(p.x, p.y)));
  console.log(`Perfect: ${l}`);
});

// Aether realm
// [General]
// StackLeniency: 0.6
// [Difficulty]
// HPDrainRate:5
// CircleSize:4.2
// OverallDifficulty:9.5
// ApproachRate:9.8
// SliderMultiplier:1.6
// SliderTickRate:1
// [Timing Points]
// 826485,285.714285714286,3,3,1,60,1,0
// 876199,-100,3,3,1,65,0,1
// [HitObjects]
// 196,210,876199,2,0,P|256:227|342:197,1,120
