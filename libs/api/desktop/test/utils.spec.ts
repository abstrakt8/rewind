import { osuFolderSanityCheck } from "@rewind/api/desktop";

const okFolder = "E:\\osu!";
const badFolder = "C:\\Users";
describe("SanityCheck", () => {
  it("okFolder", async () => {
    expect(await osuFolderSanityCheck(okFolder)).toBeTruthy();
  });
  it("badFolder", async () => {
    expect(await osuFolderSanityCheck(badFolder)).toBeFalsy();
  });
});

// TODO: Maybe test with non-absolute paths
// "hi" -> gets resolved to "C:\Users\me\Dev\rewind\hi\"
