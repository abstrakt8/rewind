import { defaultStableSettings, evaluateWholeReplay, parseReplayFramesFromFS } from "../../../others";
import {
  CheckPointState,
  GameState,
  GameStateEvaluator,
  HitCircleVerdict,
  MainHitObjectVerdict,
  OsuHitObject,
  ReplayFrame,
  Slider,
} from "@osujs/core";
import { TEST_MAPS, testReplayPath } from "../../../util";

function expectHitCircleToBeNotAMiss(hitCircleState?: HitCircleVerdict) {
  expect(hitCircleState).toBeDefined();
  const type = (hitCircleState as HitCircleVerdict).type;
  expect(type).not.toBe("MISS" as MainHitObjectVerdict);
}

const before = beforeEach;

describe("Daijobanai [Slider 1]", function () {
  let evaluator: GameStateEvaluator;
  let hitObjects: OsuHitObject[];
  let replay: ReplayFrame[];
  let state: GameState;
  before(function () {
    const s = defaultStableSettings(TEST_MAPS.ONE_SLIDER);
    hitObjects = s.hitObjects;
    evaluator = s.evaluator;
    // console.log("Read stable settings ");
  });

  // console.log(hitObjects[0]);
  //
  describe("Perfect.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(testReplayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) Perfect.osr"));
      state = evaluateWholeReplay(evaluator, replay);
    });
    it("hit circle must be hit correctly", function () {
      const hitCircleState = state.hitCircleVerdict["0/HEAD"] as HitCircleVerdict;
      // hitTime is 1684 and offset was -14, so 1684-14=1670
      const expectedState: HitCircleVerdict = { type: "GREAT", judgementTime: 1670 };
      expect(hitCircleState).toEqual(expectedState);
    });
    it("legacy slider tick must be hit", function () {
      const sliderTickState = state.checkPointVerdict["0/0"] as CheckPointState;
      expect(sliderTickState.hit).toBe(true);
    });
    it("slider verdict should be GREAT", function () {
      expect(state.sliderVerdict["0"]).toBe("GREAT");
    });
    // This gives a "300" as a judgment and a combo of 2
  });

  describe("SliderHeadMissedButTrackingWtf.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(
        testReplayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadMissedButTrackingWtf.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });
    it("hit circle missed", function () {
      const hitCircleState = state.hitCircleVerdict["0/HEAD"];
      const expectedState: HitCircleVerdict = {
        judgementTime: 1804, // 1803 or 1804 TODO: ???
        type: "MISS",
        missReason: "TIME_EXPIRED",
      };
      expect(hitCircleState).toEqual(expectedState);
    });
    it("legacy slider tick must be hit", function () {
      const sliderTickState = state.checkPointVerdict["0/0"];
      expect(sliderTickState.hit).toBe(true);
    });
    // This gives a "50" as a judgment and a combo of 1
  });

  describe("SliderHeadTooEarly.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(
        testReplayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadTooEarly.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });
    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleVerdict["0/HEAD"];
      expect(hitCircleState.judgementTime).toBe(1684 - 57);
    });
    it("legacy slider tick hit", function () {
      const sliderTickState = state.checkPointVerdict["0/0"];
      expect(sliderTickState.hit).toBe(true);
    });
  });
  describe("SliderHeadTooLate.osr", function () {
    beforeEach(function () {
      replay = parseReplayFramesFromFS(
        testReplayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadTooLate.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });

    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleVerdict["0/HEAD"];
      expectHitCircleToBeNotAMiss(hitCircleState);
      expect(hitCircleState.judgementTime).toBe(1684 + 33);
    });
    it("legacy slider tick hit", function () {
      const sliderTickState = state.checkPointVerdict["0/0"];
      expect(sliderTickState.hit).toBe(true);
    });

    it("slider verdict should be GREAT", function () {
      expect(state.sliderVerdict["0"]).toBe("GREAT");
    });
  });
  describe("SliderEndMissed.osr", function () {
    beforeEach(function () {
      replay = parseReplayFramesFromFS(
        testReplayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderEndMissed.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });

    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleVerdict["0/HEAD"];
      expectHitCircleToBeNotAMiss(hitCircleState);
    });

    it("legacy slider tick missed", function () {
      const sliderTickState = state.checkPointVerdict["0/0"];
      expect(sliderTickState.hit).toBe(false);
    });

    it("slider verdict should be OK", function () {
      expect(state.sliderVerdict["0"]).toBe("OK");
    });

    // This gives a "100" as a judgment and a combo of 1
  });
});
