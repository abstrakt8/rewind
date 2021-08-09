import { parseBlueprintFromFS, parseReplayFramesFromFS, TEST_MAPS, TEST_REPLAYS } from "./util.spec";
import { buildBeatmap, parseReplayFramesFromRaw, OsuAction, ReplayFrame } from "../src";
import { readSync } from "node-osr";

// w, x, y, z
// w time since last action
// x, y coordinates
// z bitmask of what was pressed
describe("Parsing rawReplayData (from node-osr)", function () {
  it("should ignore the first three frames from legacy due to negative", function () {
    // From RyuK +HDDT Akatsuki Zukuyo replay
    const raw = "0|256|-500|0,-1|256|-500|0,-1171|257.0417|124.7764|1";
    const actual = parseReplayFramesFromRaw(raw);
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
    const actual = parseReplayFramesFromRaw(raw);
    expect(actual).toEqual([f1]);
  });
});
