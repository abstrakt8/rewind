import { readFileSync } from "fs";
import { SkinConfigParser } from "@rewind/osu/skin";

describe("SkinConfig", function () {
  const skinIniData = readFileSync("resources/skins/-        # WhiteCat (1.0) 『CK』 #-/skin.ini", {
    encoding: "utf-8",
  });

  it("should parse correctly ", function () {
    const parser = new SkinConfigParser(skinIniData);
    const a = parser.parse();
    console.log(a);
    console.log(a.colors.comboColors);
  });
});

describe("SkinConfig - Millhiore Lite", function () {
  const skinIniData = readFileSync("resources/skins/Millhiore Lite/skin.ini", {
    encoding: "utf-8",
  });

  it("should parse correctly ", function () {
    const parser = new SkinConfigParser(skinIniData);
    const a = parser.parse();
    console.log(a);
    console.log(a.colors.comboColors);
  });
});
