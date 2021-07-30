import { readFileSync } from "fs";
import { ScoresDBReader } from "../src/ScoresDBReader";

describe("ScoresDBReader", () => {
  // TODO: File
  const fileName = "test/resources/scores.db";
  const buffer = readFileSync(fileName);
  const reader = new ScoresDBReader(buffer);

  it("should parse correctly", async () => {
    const a = await reader.readScoresDB();
    // console.log(a);
    console.log(a.beatmaps[0].scores);
    console.log(a.beatmaps[1].scores);
  });
});
