import {
  commonStats,
  createTestTimeMachine,
  defaultStableSettings,
  osuClassicScoreScreenJudgementCount,
  parseReplayFramesFromFS,
  TEST_MAPS,
  TEST_REPLAYS,
} from "../util.spec";
import {
  BucketedGameStateTimeMachine,
  isSlider,
  osuStableAccuracy,
  parseReplayFramesFromRaw,
  Slider,
} from "@rewind/osu/core";
import { readSync } from "node-osr";

describe("Parsing SunMoonStar", function () {
  const r = parseReplayFramesFromFS(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);

  // .osr 336KB
  // OsrReplay 1.5MB
  // ReplayFrames 5.2MB
  // Parsing + Read took exactly 1s
  // console.log(JSON.stringify(r).length);

  it("should not have duplicated frames", function () {
    const seen: Record<number, boolean> = {};
    for (const frame of r) {
      expect(frame.time in seen).toBeFalsy();
      seen[frame.time] = true;
    }
  });
});

test("Testing frame times", function () {
  const { timeMachine, beatmap, replay } = createTestTimeMachine(
    TEST_MAPS.SUN_MOON_STAR,
    TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN,
  );

  const i = beatmap.hitObjects.findIndex((o) => isSlider(o) && o.startTime === 876199);
  const slider = beatmap.hitObjects[i] as Slider;
  console.log(slider);

  // commonStats(replay.frames, 36);

  // 876399
  console.log("wait");
});

test("FromRawToReplay Speed test", function () {
  console.time("readSync");
  const a = readSync(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);
  console.timeEnd("readSync");

  console.time("fromRawToReplay");
  parseReplayFramesFromRaw(a.replay_data);
  console.timeEnd("fromRawToReplay");
});

describe("OsuStd! ReplayTimeMachine - The Sun, The Moon, The Stars", function () {
  const { hitObjects, settings, beatmap, hitWindows } = defaultStableSettings(TEST_MAPS.SUN_MOON_STAR);
  const frames = parseReplayFramesFromFS(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);

  console.log("Starting SunMoonStar");
  console.log(`HitObjects: ${hitObjects.length} Frames: ${frames.length}`);
  console.log(hitWindows);

  const timeMachine = new BucketedGameStateTimeMachine(frames, beatmap, settings);
  const timeInMs = (min: number, sec: number, ms: number) => ms + sec * 1000 + min * 1000 * 60;

  function evaluateForTime(ms: number) {
    const state = timeMachine.gameStateAt(ms); // 1:3:866
    console.log("Evaluating to time ", ms);

    // Combo at the time should be ~607
    const cnt = osuClassicScoreScreenJudgementCount(state, hitObjects);
    const acc = osuStableAccuracy(cnt);
    // console.log(`Current Combo: ${state.currentCombo}  (MaxComboSoFar: ${state.maxCombo})`);
    console.log(cnt);
    console.log(`Acc: ${acc * 100}%`);

    // const dict = normalizeHitObjects(hitObjects);
    // for (const [id, s] of state.hitCircleState) {
    //   if (s.type !== HitObjectJudgementType.Great) {
    //     console.log("not great at ", id, s);
    //     console.log(dict[id]);
    //   }
    // }
    // for (const [id, s] of state.sliderJudgement) {
    //   if (s !== HitObjectJudgementType.Great) {
    //     console.log("slider not great at id=", id);
    //     console.log(dict[id]);
    //   }
    // }
    // for (const [id, s] of state.hitCircleState) {
    //   if (s.type === HitObjectJudgementType.Miss) {
    //     console.log("missed at ", id, s);
    //     console.log(dict[id]);
    //   }
    // }
    // for (const [id, s] of state.sliderJudgement) {
    //   if (s === HitObjectJudgementType.Miss) {
    //     console.log("slider MISS at id=", id);
    //     console.log(dict[id]);
    //   }
    // }
  }

  /**
   * Somewhat output:
   * HitObjects: 6953 Frames: 79946
   [ 22, 63, 104, 399 ]
   Evaluating to time  63866
   Current Combo: 608  (MaxComboSoFar: 608)
   [ 480, 2, 0, 0 ]
   Acc: 99.72337482710927%
   Evaluating to time  112000
   Current Combo: 1057  (MaxComboSoFar: 1057)
   [ 836, 13, 0, 0 ]
   Acc: 98.97919120533962%
   Evaluating to time  532000
   Current Combo: 4494  (MaxComboSoFar: 4494)
   [ 3503, 26, 0, 0 ]
   Acc: 99.50883158590725%
   Evaluating to time  1072000
   Current Combo: 21  (MaxComboSoFar: 8623)
   [ 6899, 50, 0, 0 ]
   Acc: 99.52031467357413%
   */

  evaluateForTime(timeInMs(1, 3, 866));
  evaluateForTime(timeInMs(1, 52, 0));
  evaluateForTime(timeInMs(8, 52, 0));
  evaluateForTime(timeInMs(17, 52, 0));
  expect(true).toBeTruthy();
});

// TODO: Create testcase
// -> Releasing, but sliderCheckPoint is like before release
