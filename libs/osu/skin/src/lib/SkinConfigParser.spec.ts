import { parseSkinIni } from "./SkinConfigParser";

test("WhiteCat1.0/skin.ini parsing correctly", function () {
  // Source: WhiteCat 2.1 old lite
  const data = `
[General]
  //----------General
    Name: -        # WhiteCat (1.0) 『CK』 #-
    Author: cyperdark
    Version: 2.5

  //----------Settings
    AnimationFramerate: 60
    AllowSliderBallTint: 1
    ComboBurstRandom: 0
    HitCircleOverlayAboveNumer: 0
    SliderBallFlip: 1
    SliderStyle: 2

  //----------Cursor
    CursorExpand: 0
    CursorCentre: 1
    CursorRotate: 0
    CursorTrailRotate: 0

[Colours]
  //----------Combo colors
    Combo1: 198, 173, 159 // #C6AD9F
    Combo2: 150, 139, 136  // #968B88

  //----------Text colors
    InputOverlayText: 78, 70, 67 // #FFFFFF
    SongSelectActiveText: 255, 255, 255 // #FFFFFF
    SongSelectInactiveText: 200, 200, 200 // #C8C800

  //----------Menu lines color
    MenuGlow: 83, 127, 214 // #537FD6

  //----------Spinner
    SpinnerBackground: 255, 255, 255 // #FFFFFF

  //----------Slider
    //SliderBorder: 150, 139, 136 // #C6AD9F  #B29C8F
    //SliderTrackOverride: 26, 24, 23 // #211813  #1A130F  #140F0C  #1A1817
    //SliderBorder: 119, 110, 108 // #C6AD9F  #B29C8F  #757D5B  #968B88
    //SliderTrackOverride: 35, 33, 32 // #211813  #1A130F  #140F0C  #1A1817  #1E2113  #2C2928
    SliderBorder: 80, 80, 80
    SliderTrackOverride: 0, 0, 0

[Fonts]
  //----------Hitcircle font
    HitCirclePrefix: Assets/default/default
    HitCircleOverlap: 15

  //----------Score font
    ScorePrefix: Assets/score/score
    ScoreOverlap: 10

  //----------Combo font
    ComboPrefix: Assets/combo/combo
    ComboOverlap: 10
  `;
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
  const data = `
[General]
Name: Millhiore Lite
Author: MillhioreF

CursorExpand: 1
SliderBallFrames: 2
SliderBallFlip: 0
Version: latest

[Colours]
SliderTrackOverride:0,0,0
[Mania]
Keys: 4
//Mania skin config
ColumnStart: 136
HitPosition: 402
SpecialStyle: 0
UpsideDown: 0
JudgementLine: 1
ScorePosition: 325
ComboPosition: 111
LightFramePerSecond: 24
ColumnWidth: 30,30,30,30
//Colours
//images
//Keys
[Mania]
Keys: 5
//Mania skin config
ColumnStart: 136
HitPosition: 402
SpecialStyle: 0
UpsideDown: 0
JudgementLine: 1
ScorePosition: 325
ComboPosition: 111
LightFramePerSecond: 24
ColumnWidth: 30,30,30,30,30
//Colours
//images
//Keys
[Mania]
Keys: 6
//Mania skin config
ColumnStart: 136
HitPosition: 402
SpecialStyle: 0
UpsideDown: 0
JudgementLine: 1
ScorePosition: 325
ComboPosition: 111
LightFramePerSecond: 24
ColumnWidth: 30,30,30,30,30,30
//Colours
//images
//Keys
[Mania]
Keys: 7
//Mania skin config
ColumnStart: 136
HitPosition: 402
SpecialStyle: 0
UpsideDown: 0
JudgementLine: 1
ScorePosition: 325
ComboPosition: 111
LightFramePerSecond: 24
ColumnWidth: 30,30,30,30,30,30,30
//Colours
//images
//Keys
[Mania]
Keys: 8
//Mania skin config
ColumnStart: 136
HitPosition: 402
SpecialStyle: 0
UpsideDown: 0
JudgementLine: 1
ScorePosition: 325
ComboPosition: 111
LightFramePerSecond: 24
ColumnWidth: 30,30,30,30,30,30,30,30
//Colours
//images
//Keys
  `;

  const skinIni = parseSkinIni(data);
  const { general, colors } = skinIni;

  expect(general.name).toEqual("Millhiore Lite");

  // The colors do not exist so it's just using the default values
  expect(colors.comboColors).toEqual([
    [255, 192, 0],
    [0, 202, 0],
    [18, 124, 255],
    [242, 24, 57],
  ]);
});
