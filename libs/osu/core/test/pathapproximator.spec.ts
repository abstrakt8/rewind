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
