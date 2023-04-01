import { readFileSync } from "fs";
import { ScoresDBReader } from "@rewind/osu-local/db-reader";
import { getOsuGameDir } from "../util";
import { join } from "path";

describe("ScoresDBReader", () => {
  const fileName = join(getOsuGameDir(), "scores.db");
  const buffer = readFileSync(fileName);
  const reader = new ScoresDBReader(buffer);

  it("should parse correctly", async () => {
    const scoresDB = await reader.readScoresDB();
    expect(scoresDB.beatmaps.length).toBeGreaterThan(0);
    // console.log(scoresDB.beatmaps[0].scores);
    // console.log(scoresDB.beatmaps[1].scores);
  });
});
