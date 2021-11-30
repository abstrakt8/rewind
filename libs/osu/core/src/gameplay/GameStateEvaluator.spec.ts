import { newPressingSince } from "./GameStateEvaluator";
import { NOT_PRESSING } from "./GameState";
import { OsuAction } from "../replays/Replay";

describe("newPressingSince", function () {
  it("initial with new value at new click", function () {
    expect(newPressingSince([NOT_PRESSING, NOT_PRESSING], [OsuAction.leftButton], 10)).toEqual([10, NOT_PRESSING]);
  });
  it("keep the old value if still pressing", function () {
    expect(newPressingSince([30, NOT_PRESSING], [OsuAction.leftButton], 42)).toEqual([30, NOT_PRESSING]);
  });
  it("stay [NOT_PRESSING, NOT_PRESSING] when no action given", function () {
    expect(newPressingSince([NOT_PRESSING, NOT_PRESSING], [], -420)).toEqual([NOT_PRESSING, NOT_PRESSING]);
  });
  it("return to [NOT_PRESSING, NOT_PRESSING] when no action given", function () {
    expect(newPressingSince([320, 500], [], 600)).toEqual([NOT_PRESSING, NOT_PRESSING]);
  });
});
