import { commonStats, createTestTimeMachine, parseReplayFramesFromFS, TEST_MAPS, TEST_REPLAYS } from "../util.spec";
import { parseReplayFramesFromRaw } from "@rewind/osu/core";
import { readSync } from "node-osr";

describe("Parsing SunMoonStar", function () {
  const r = parseReplayFramesFromFS(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);

  // .osr 336KB
  // OsrReplay 1.5MB
  // ReplayFrames 5.2MB
  // Parsing + Read took exactly 1s
  console.log(JSON.stringify(r).length);

  it("should not have duplicated frames", function () {
    const seen: Record<number, boolean> = {};
    for (const frame of r) {
      expect(frame.time in seen).toBeFalsy();
      seen[frame.time] = true;
    }
  });
});

describe("Testing frame times", function () {
  const { timeMachine, beatmap, replay } = createTestTimeMachine(
    TEST_MAPS.SUN_MOON_STAR,
    TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN,
  );

  commonStats(replay.frames, 20);

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
