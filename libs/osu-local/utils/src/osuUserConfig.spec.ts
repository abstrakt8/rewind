import { osuUserConfigParse } from "./osuUserConfig";

test("Parsing osu!.[username].cfg config", async () => {
  const data = `
# osu! configuration for me
# last updated on Tuesday, November 2, 2021

# IMPORTANT: DO NOT SHARE THIS FILE PUBLICLY.
# IT CONTAINS YOUR LOGIN CREDENTIALS IF YOU HAVE THEM SAVED.

BeatmapDirectory = Songs
VolumeUniversal = 65
VolumeEffect = 100
VolumeMusic = 30
Skin = - Amaestric [1.1]
SkinWithSpaceAtTheEnd = WhiteCat 1.0\u0020

# Comment = Should Be Ignored
`;
  // \u0020 is the explicit space character

  // I also tested BeatmapDirectory = "SomethingInQuotations" and this won't be parsed correctly by osu!

  const records = osuUserConfigParse(data);

  expect(records["BeatmapDirectory"]).toEqual("Songs");
  expect(records["VolumeMusic"]).toEqual("30");
  expect(records["Skin"]).toEqual("- Amaestric [1.1]");
  expect(records["SkinWithSpaceAtTheEnd"]).toEqual("WhiteCat 1.0 ");
  expect(records["Comment"]).toBeUndefined();
});
