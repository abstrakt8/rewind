import { readFileSync } from "fs";
import { SkinConfigParser } from "./SkinConfigParser";

test("SkinConfig parsing correctly", function () {
  const skinIniData = readFileSync("resources/skins/-        # WhiteCat (1.0) 『CK』 #-/skin.ini", {
    encoding: "utf-8",
  });

  const parser = new SkinConfigParser(skinIniData);
  const a = parser.parse();
  console.log(a);
  console.log(a.colors.comboColors);
});

test("SkinConfig - Millhiore Lite parsing correctly", function () {
  const skinIniData = readFileSync("resources/skins/Millhiore Lite/skin.ini", {
    encoding: "utf-8",
  });

  const parser = new SkinConfigParser(skinIniData);
  const a = parser.parse();
  console.log(a);
  console.log(a.colors.comboColors);
});
