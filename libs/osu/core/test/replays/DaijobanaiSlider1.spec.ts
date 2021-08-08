import {
  defaultStableSettings,
  evaluateWholeReplay,
  parseReplayFramesFromFS,
  replayPath,
  TEST_MAPS,
} from "../util.spec";
import {
  CheckPointState,
  HitCircleMissReason,
  HitCircleState,
  MainHitObjectVerdict,
  NextFrameEvaluator,
  OsuHitObject,
  ReplayFrame,
  GameState,
  Slider,
} from "../../src";

function expectHitCircleToBeNotAMiss(hitCircleState?: HitCircleState) {
  expect(hitCircleState).toBeDefined();
  const type = (hitCircleState as HitCircleState).type;
  expect(type).not.toBe("MISS" as MainHitObjectVerdict);
}

const before = beforeEach;

describe("Daijobanai [Slider 1]", function () {
  let evaluator: NextFrameEvaluator;
  let hitObjects: OsuHitObject[];
  let replay: ReplayFrame[];
  let state: GameState;
  before(function () {
    const s = defaultStableSettings(TEST_MAPS.ONE_SLIDER);
    hitObjects = s.hitObjects;
    evaluator = s.evaluator;
    console.log("Read stable settings ");
  });

  // console.log(hitObjects[0]);
  //
  describe("Perfect.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(replayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) Perfect.osr"));
      state = evaluateWholeReplay(evaluator, replay);
      console.log("Read and evaluated perfect", replay.length);
    });
    it("hit circle must be hit correctly", function () {
      console.log("it hitcircle must be hit correctly perfect");
      const hitCircleState = state.hitCircleState.get("0/HEAD") as HitCircleState;
      // hitTime is 1684 and offset was -14, so 1684-14=1670
      const expectedState: HitCircleState = { type: "GREAT", judgementTime: 1670 };
      expect(hitCircleState).toEqual(expectedState);
      console.log(hitCircleState);
    });
    it("legacy slider tick must be hit", function () {
      const sliderTickState = state.checkPointState.get("0/0") as CheckPointState;
      expect(sliderTickState.hit).toBe(true);
    });
    // This gives a "300" as a judgment and a combo of 2
  });

  describe("SliderHeadMissedButTrackingWtf.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(
        replayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadMissedButTrackingWtf.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
      console.log("Read and evaluated SliderHeadMissedBut", replay.length);
    });
    it("hit circle missed", function () {
      console.log("Hit circle missed");
      const hitCircleState = state.hitCircleState.get("0/HEAD") as HitCircleState;
      const expectedState: HitCircleState = {
        judgementTime: 1804, // 1803 or 1804 TODO: ???
        type: "MISS",
        missReason: HitCircleMissReason.TIME_EXPIRED,
      };
      expect(hitCircleState).toEqual(expectedState);
    });
    it("legacy slider tick must be hit", function () {
      const sliderTickState = state.checkPointState.get("0/0") as CheckPointState;
      expect(sliderTickState.hit).toBe(true);
    });
    // This gives a "50" as a judgment and a combo of 1
  });

  describe("SliderHeadTooEarly.osr", function () {
    before(function () {
      replay = parseReplayFramesFromFS(
        replayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadTooEarly.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });
    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleState.get("0/HEAD") as HitCircleState;
      expect(hitCircleState.judgementTime).toBe(1684 - 57);
    });
    it("legacy slider tick hit", function () {
      const sliderTickState = state.checkPointState.get("0/0") as CheckPointState;
      expect(sliderTickState.hit).toBe(true);
    });
  });
  describe("SliderHeadTooLate.osr", function () {
    beforeEach(function () {
      replay = parseReplayFramesFromFS(
        replayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderHeadTooLate.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });

    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleState.get("0/HEAD") as HitCircleState;
      expectHitCircleToBeNotAMiss(hitCircleState);
      expect(hitCircleState.judgementTime).toBe(1684 + 33);
    });
    it("legacy slider tick hit", function () {
      const sliderTickState = state.checkPointState.get("0/0") as CheckPointState;
      expect(sliderTickState.hit).toBe(true);
    });
  });
  describe("SliderEndMissed.osr", function () {
    beforeEach(function () {
      replay = parseReplayFramesFromFS(
        replayPath("- Perfume - Daijobanai [Slider 1] (2021-07-07) SliderEndMissed.osr"),
      );
      state = evaluateWholeReplay(evaluator, replay);
    });

    it("hit circle hit", function () {
      const hitCircleState = state.hitCircleState.get("0/HEAD") as HitCircleState;
      expectHitCircleToBeNotAMiss(hitCircleState);
    });
    it("legacy slider tick missed", function () {
      const sliderTickState = state.checkPointState.get("0/0") as CheckPointState;
      console.log(hitObjects[0] as Slider);
      expect(sliderTickState.hit).toBe(false);
    });
    // This gives a "100" as a judgment and a combo of 1
  });
});
