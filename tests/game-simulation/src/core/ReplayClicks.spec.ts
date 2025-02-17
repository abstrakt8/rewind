import { parseReplayFramesFromFS } from "../others";
import { testReplayPath } from "../util";
import { calculateReplayClicks } from "@osujs/core";

describe("calculateReplayClicks", function () {
  it("should calculate clicks correctly for replay frames that have a click starting at 0", function () {
    const replay = parseReplayFramesFromFS(
      testReplayPath("kellad - Asriel - Raison D'etre [EXist] (2025-02-16) Osu.osr"),
    );
    const replayClicks = calculateReplayClicks(replay);
    expect(replayClicks.map((r) => r.length)).toEqual([839, 878]);
  });
});
