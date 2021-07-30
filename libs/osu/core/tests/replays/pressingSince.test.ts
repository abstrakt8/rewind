import { describe } from "mocha";
import { expect } from "chai";
import { newPressingSince, NOT_PRESSING, OsuAction } from "../../src";

describe("ReplayState", function () {
  describe("not pressing since", function () {
    it("should initial with new value at new click", function () {
      expect(newPressingSince([NOT_PRESSING, NOT_PRESSING], [OsuAction.leftButton], 10)).to.eql([10, NOT_PRESSING]);
    });
    it("should keep the old value if still pressing", function () {
      expect(newPressingSince([30, NOT_PRESSING], [OsuAction.leftButton], 42)).to.eql([30, NOT_PRESSING]);
    });
    it("should stay [NOT_PRESSING, NOT_PRESSING] when no action given", function () {
      expect(newPressingSince([NOT_PRESSING, NOT_PRESSING], [], -420)).to.eql([NOT_PRESSING, NOT_PRESSING]);
    });
    it("should return to [NOT_PRESSING, NOT_PRESSING] when no action given", function () {
      expect(newPressingSince([320, 500], [], 600)).to.eql([NOT_PRESSING, NOT_PRESSING]);
    });
  });
});
