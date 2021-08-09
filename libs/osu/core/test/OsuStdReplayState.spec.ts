import {
  defaultStableSettings,
  evaluateWholeReplay,
  osuClassicScoreScreenJudgementCount,
  parseReplayFramesFromFS,
  replayPath,
  TEST_MAPS,
} from "./util.spec";
import { GameState, HitCircleVerdict } from "../src/gameplay/GameState";
import { BucketedGameStateTimeMachine } from "../src/gameplay/GameStateTimeMachine";
import { Slider } from "../src/hitobjects/Slider";

/**
 * Info on [Slider 1]
 * One slider:
 * HitTime = 1684
 */

describe("Daijobanai [Slider (Repeat = 1)]", function () {
  const { evaluator, hitObjects } = defaultStableSettings(TEST_MAPS.SLIDER_WITH_ONE_REPEAT);
  console.log("Slider with repeat = 1", hitObjects[0]);
  const sliderHeadId = "0/HEAD",
    repeatId = "0/0",
    lastTickId = "0/1";

  describe("- Perfume - Daijobanai [Slider (Repeat = 1)] (2021-07-07) Perfect.osr", function () {
    const replay = parseReplayFramesFromFS(
      replayPath("- Perfume - Daijobanai [Slider (Repeat = 1)] (2021-07-07) Perfect.osr"),
    );
    const state = evaluateWholeReplay(evaluator, replay);
    it("slider head circle must be hit", function () {
      expect(state.hitCircleVerdict[sliderHeadId]?.type).not.toBe("MISS");
    });
    it("repeat and last tick must be hit", function () {
      expect(state.checkPointVerdict[repeatId]?.hit).toBe(true);
      expect(state.checkPointVerdict[lastTickId]?.hit).toBe(true);
    });
  });
});

/**
 * Info on [Short kick slider]
 *
 * hitTime: 1684,
 * endTime: 1715.25
 */
describe("Daijobanai [Short kick slider]", function () {
  const { evaluator, hitObjects } = defaultStableSettings(TEST_MAPS.SHORT_KICK_SLIDER);
  const slider = hitObjects[0] as Slider;

  console.log("Short kick slider", slider.id, slider.head.hitTime, slider.endTime, slider.endPosition);
  const sliderHeadId = "0/HEAD",
    lastTickId = "0/0";

  describe("- Perfume - Daijobanai [Short kick slider] (2021-07-16) Perfect.osr", function () {
    const replay = parseReplayFramesFromFS(
      replayPath("- Perfume - Daijobanai [Short kick slider] (2021-07-16) Perfect.osr"),
    );
    const state = evaluateWholeReplay(evaluator, replay);
    it("slider head circle must be hit", function () {
      expect(state.hitCircleVerdict[sliderHeadId]?.type).not.toBe("MISS");
    });
    it("last tick must be missed", function () {
      expect(state.checkPointVerdict[lastTickId]?.hit).toBe(true);
    });
  });

  describe("- Perfume - Daijobanai [Short kick slider] (2021-07-16) TooLateMissed.osr", function () {
    const replay = parseReplayFramesFromFS(
      replayPath("- Perfume - Daijobanai [Short kick slider] (2021-07-16) TooLateMissed.osr"),
    );
    const state = evaluateWholeReplay(evaluator, replay);
    it("slider head circle must have been missed due to slider too short force miss", function () {
      const actualState = state.hitCircleVerdict[sliderHeadId];
      const expectedState: HitCircleVerdict = {
        judgementTime: 1715.25,
        missReason: "SLIDER_FINISHED_FASTER",
        type: "MISS",
      };
      expect(actualState).toEqual(expectedState);
    });
    it("last tick must be missed", function () {
      expect(state.checkPointVerdict[lastTickId]?.hit).toBe(false);
    });
  });
});

describe("OsuStd! ReplayState - Violet Perfume (no sliders/spinners)", function () {
  const { hitObjects, settings, evaluator, beatmap, hitWindows } = defaultStableSettings(TEST_MAPS.VIOLET_PERFUME);
  const replay = parseReplayFramesFromFS(replayPath("abstrakt - SHK - Violet Perfume [Insane] (2021-03-27) Osu.osr"));
  console.log(hitWindows);

  const finalState = evaluateWholeReplay(evaluator, replay);

  function count(state: GameState) {
    return osuClassicScoreScreenJudgementCount(state, hitObjects);
  }

  // console.log(state.unnecessaryClicks);

  it("should be 544x300s, 22x100s, 7x50s and 4 misses at the end", function () {
    expect(count(finalState)).toEqual([544, 22, 7, 4]);
  });

  describe("OsuReplayState TimeMachine", function () {
    const timeMachine = new BucketedGameStateTimeMachine(replay, beatmap, settings);

    // Not 100% sure, only checked with VLC
    it("at t=5s should be [23, 0, 0, 0]", function () {
      const at5 = [23, 0, 0, 0];
      expect(count(timeMachine.gameStateAt(5 * 1000))).toEqual(at5);
    });

    // Not 100% sure, only checked with VLC
    it("at t=52s should be [267, 6, 6, 1]", function () {
      const at52 = [267, 6, 6, 1];
      expect(count(timeMachine.gameStateAt(52 * 1000))).toEqual(at52);

      // Just a small test if it actually goes back properly to an unmodified state with immerjs
      const at5 = [23, 0, 0, 0];
      expect(count(timeMachine.gameStateAt(5 * 1000))).toEqual(at5);
    });

    // Basically t=300s exceeds the map's duration, but that should also work in this case
    it("at t=300s should be [544, 22, 7, 4]", function () {
      const atEnd = [544, 22, 7, 4]; // This is the only one that is 100% correct
      expect(count(timeMachine.gameStateAt(300 * 1000))).toEqual(atEnd);
    });
  });
});

// This case is possible:

// SliderHead not hit
// All SliderTicks before last legacy tick hit
// HitSliderHead before last legacy tick
// Hit last legacy tick
