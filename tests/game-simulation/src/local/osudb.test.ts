import { readFileSync } from "fs";
import { OsuDBReader } from "@rewind/osu-local/db-reader";
import { getOsuGameDir } from "../util";
import { join } from "path";

describe("OsuDBReader - normal case", () => {
  const fileName = join(getOsuGameDir(), "osu!.db");
  const buffer = readFileSync(fileName);
  const reader = new OsuDBReader(buffer);

  it("should parse correctly", async () => {
    const osuDB = await reader.readOsuDB();
    expect(osuDB.osuVersion).toBe(20210820);
    expect(osuDB.folderCount).toBe(3175);
    // console.log(osuDB);
  });
});
