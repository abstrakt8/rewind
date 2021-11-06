import { readFileSync } from "fs";
import { parseSkinIni } from "./SkinConfigParser";

test("WhiteCat1.0/skin.ini parsing correctly", function () {
  // Source: WhiteCat 2.1 old lite
  const data = readFileSync("resources/WhiteCatSkin.ini", "utf-8");
  const skinIni = parseSkinIni(data);
  const { general, colors, fonts } = skinIni;
  // Just checking the most important ones ...

  // General
  expect(general.name).toEqual("-        # WhiteCat (1.0) 『CK』 #-");
  expect(general.author).toEqual("cyperdark");
  expect(general.version).toEqual("2.5");
  expect(general.animationFrameRate).toEqual(60);
  expect(general.allowSliderBallTint).toEqual(true);

  // Colors
  expect(colors.comboColors).toEqual([
    [198, 173, 159],
    [150, 139, 136],
  ]);
  expect(colors.sliderBorder).toEqual([80, 80, 80]);

  // Fonts
  expect(fonts.hitCirclePrefix).toEqual("Assets/default/default");
  expect(fonts.hitCircleOverlap).toEqual(15);
  expect(fonts.scoreOverlap).toEqual(10);
  expect(fonts.scorePrefix).toEqual("Assets/score/score");
  expect(fonts.comboOverlap).toEqual(10);
  expect(fonts.comboPrefix).toEqual("Assets/combo/combo");
});

test("MillhioreLite/skin.ini parsing - missing some values", function () {
  const data = readFileSync("resources/MillhioreLiteSkin.ini", "utf-8");

  const skinIni = parseSkinIni(data);
  const { general, colors, fonts } = skinIni;

  expect(general.name).toEqual("Millhiore Lite");

  // The colors do not exist so it's just using the default values
  expect(colors.comboColors).toEqual([
    [255, 192, 0],
    [0, 202, 0],
    [18, 124, 255],
    [242, 24, 57],
  ]);
});
