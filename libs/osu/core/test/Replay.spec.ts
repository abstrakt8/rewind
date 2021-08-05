import { parseBlueprintFromFS, parseReplayFromFS, TEST_MAPS, TEST_REPLAYS } from "./util.spec";
import { buildBeatmap, fromRawToReplay, OsuAction, ReplayFrame } from "../src";
import { readSync } from "node-osr";

// w, x, y, z
// w time since last action
// x, y coordinates
// z bitmask of what was pressed
describe("Parsing rawReplayData (from node-osr)", function () {
  it("should ignore the first three frames from legacy due to negative", function () {
    // From RyuK +HDDT Akatsuki Zukuyo replay
    const raw = "0|256|-500|0,-1|256|-500|0,-1171|257.0417|124.7764|1";
    const actual = fromRawToReplay(raw);
    expect(actual).toStrictEqual([]);
    // assert.deepStrictEqual(actual, []);
    console.log(actual);
  });
  it("should have the first correct frame", function () {
    // From RyuK +HDDT Akatsuki Zukuyo replay
    const raw = "0|256|-500|0,-1|256|-500|0,-1171|257.0417|124.7764|1,13|256.8854|124.8789|1";
    const f1: ReplayFrame = {
      time: -1171 - 1 + 13,
      position: { x: 256.8854, y: 124.8789 },
      actions: [OsuAction.leftButton],
    };
    const actual = fromRawToReplay(raw);
    expect(actual).toEqual([f1]);
  });
});

describe("Parsing SunMoonStar", function () {
  const r = parseReplayFromFS(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);

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

describe("SElf test", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SUN_MOON_STAR);
  const beatmap = buildBeatmap(bluePrint, { addStacking: true });
  const replay = parseReplayFromFS(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);

  // 876399
  console.log("wait");
});

describe("FromRawToReplay Speed test", function () {
  console.time("readSync");
  const a = readSync(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);
  console.timeEnd("readSync");

  console.time("fromRawToReplay");
  fromRawToReplay(a.replay_data);
  console.timeEnd("fromRawToReplay");
});
