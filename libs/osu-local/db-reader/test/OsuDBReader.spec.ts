import { readFileSync } from "fs";
import { OsuDBReader } from "../src/OsuDBReader";

describe("OsuDBParser", () => {
  // TODO: File
  const fileName = "test/resources/osu!.db";
  const buffer = readFileSync(fileName);
  const reader = new OsuDBReader(buffer);

  it("should parse correctly", async () => {
    const a = await reader.readOsuDB();
    console.log(a);
  });
});
