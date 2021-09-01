export type TextureConfig = {
  filePrefix: string;
  animationFrameRate?: number;
  skipHyphen?: boolean; // Most of the animated textures use hyphen '-' , but some do not such as sliderb0.png.
};

// https://osu.ppy.sh/wiki/en/Skinning/Interface (normal)
// https://osu.ppy.sh/wiki/el/Skinning/osu%21 (osu!std)
// Others are not supported
// TODO: Refactor to type?
export enum SkinTextures {
  // HitCircle
  APPROACH_CIRCLE = "approachcircle",
  HIT_CIRCLE = "hitcircle",
  HIT_CIRCLE_OVERLAY = "hitcircleoverlay",

  // // Sliders
  SLIDER_BALL = "sliderball",
  // SLIDER_END_CIRCLE = "",
  SLIDER_FOLLOW_CIRCLE = "sliderfollowcircle",
  // (also known as slider score point)
  SLIDER_TICK = "slidertick",
  SLIDER_REPEAT = "sliderrepeat",
  //
  // // Spinner
  SPINNER_APPROACH_CIRCLE = "SPINNER_APPROACH_CIRCLE",
  SPINNER_BACKGROUND = "SPINNER_BACKGROUND",
  SPINNER_BOTTOM = "SPINNER_BOTTOM",
  SPINNER_CIRCLE = "SPINNER_CIRCLE",
  SPINNER_CLEAR = "SPINNER_CLEAR",
  SPINNER_GLOW = "SPINNER_GLOW",
  SPINNER_MIDDLE2 = "SPINNER_MIDDLE2",
  SPINNER_MIDDLE = "SPINNER_MIDDLE",
  SPINNER_OSU = "SPINNER_OSU",
  SPINNER_RPM = "SPINNER_RPM",
  SPINNER_SPIN = "SPINNER_SPIN",
  SPINNER_TOP = "SPINNER_TOP",

  // I think default shouldn't even exist -> Score and Combo might use them but also might not
  DEFAULT_0 = "default0",
  DEFAULT_1 = "default1",
  DEFAULT_2 = "default2",
  DEFAULT_3 = "default3",
  DEFAULT_4 = "default4",
  DEFAULT_5 = "default5",
  DEFAULT_6 = "default6",
  DEFAULT_7 = "default7",
  DEFAULT_8 = "default8",
  DEFAULT_9 = "default9",

  COMBO_0 = "combo0",
  COMBO_1 = "combo1",
  COMBO_2 = "combo2",
  COMBO_3 = "combo3",
  COMBO_4 = "combo4",
  COMBO_5 = "combo5",
  COMBO_6 = "combo6",
  COMBO_7 = "combo7",
  COMBO_8 = "combo8",
  COMBO_9 = "combo9",

  // Font for HitCircle combo numbers
  HIT_CIRCLE_0 = "hitcircle0",
  HIT_CIRCLE_1 = "hitcircle1",
  HIT_CIRCLE_2 = "hitcircle2",
  HIT_CIRCLE_3 = "hitcircle3",
  HIT_CIRCLE_4 = "hitcircle4",
  HIT_CIRCLE_5 = "hitcircle5",
  HIT_CIRCLE_6 = "hitcircle6",
  HIT_CIRCLE_7 = "hitcircle7",
  HIT_CIRCLE_8 = "hitcircle8",
  HIT_CIRCLE_9 = "hitcircle9",

  // // Judgments
  HIT_0 = "hit0",
  HIT_50 = "hit50",
  HIT_100 = "hit100",
  HIT_100K = "hit100k",
  HIT_300 = "hit300",
  HIT_300K = "hit300k",
  // There is also 300g for osu!mania (which gives 320 points)
  //
  // // Others
  CURSOR = "cursor",
  // CURSOR_SMOKE,
  CURSOR_TRAIL = "cursortrail",
  // CURSOR_MIDDLE, // ??
  // FOLLOW_POINT,
  // COUNT_3,
  // COUNT_2,
  // COUNT_1,
  // COUNT_GO,
  //
  // INPUT_OVERLAY_BACKGROUND,
  // INPUT_OVERLAY_KEY,
  //
  // ARROW_WARNING,
  // ARROW_PAUSE,
  //
  // // Mods
  // MOD_AUTOPLAY,
  // MOD_CINEMA,
  // MOD_DOUBLETIME,
  // MOD_EASY,
  // MOD_FLASHLIGHT,
  // MOD_HALFTIME,
  // MOD_HARDROCK,
  // MOD_HIDDEN,
  // MOD_NIGHTCORE,
  // MOD_NOFAIL,
  // MOD_PERFECT,
  // MOD_RELAX,
  // MOD_SCOREV2,
  // MOD_SPUNOUT,
  // MOD_SUDDENDEATH,
  // MOD_TARGET
}

export const HIT_CIRCLE_FONT = Object.freeze([
  SkinTextures.HIT_CIRCLE_0,
  SkinTextures.HIT_CIRCLE_1,
  SkinTextures.HIT_CIRCLE_2,
  SkinTextures.HIT_CIRCLE_3,
  SkinTextures.HIT_CIRCLE_4,
  SkinTextures.HIT_CIRCLE_5,
  SkinTextures.HIT_CIRCLE_6,
  SkinTextures.HIT_CIRCLE_7,
  SkinTextures.HIT_CIRCLE_8,
  SkinTextures.HIT_CIRCLE_9,
]);

export const isHitCircleFont = (skinTexture: SkinTextures): number => {
  return HIT_CIRCLE_FONT.indexOf(skinTexture);
};

export function getComboFontKeys() {
  return [
    SkinTextures.COMBO_0,
    SkinTextures.COMBO_1,
    SkinTextures.COMBO_2,
    SkinTextures.COMBO_3,
    SkinTextures.COMBO_4,
    SkinTextures.COMBO_5,
    SkinTextures.COMBO_6,
    SkinTextures.COMBO_7,
    SkinTextures.COMBO_8,
    SkinTextures.COMBO_9,
  ];
}

// Default configs taken from the osu!wiki
// https://osu.ppy.sh/wiki/el/Skinning/osu%21
// export const DefaultTextureConfig:  { [key in keyof typeof SkinTextures]: TextureConfig } = {
type DefaultTextureConfigType = Partial<Record<SkinTextures, TextureConfig>>;

export const TO_BE_DECIDED_BY_SKIN_INI = -1;
const defaultNumberConfig = (digit: number): TextureConfig => ({
  filePrefix: `default-${digit}`,
  // No animation possible
});
const defaultScoreConfig = (digit: number): TextureConfig => ({
  filePrefix: `score-${digit}`,
  // No animation possible
});

export const getDefaultNumberSkinTexture = (digit: number): SkinTextures => {
  switch (digit) {
    case 0:
      return SkinTextures.DEFAULT_0;
    case 1:
      return SkinTextures.DEFAULT_1;
    case 2:
      return SkinTextures.DEFAULT_2;
    case 3:
      return SkinTextures.DEFAULT_3;
    case 4:
      return SkinTextures.DEFAULT_4;
    case 5:
      return SkinTextures.DEFAULT_5;
    case 6:
      return SkinTextures.DEFAULT_6;
    case 7:
      return SkinTextures.DEFAULT_7;
    case 8:
      return SkinTextures.DEFAULT_8;
    case 9:
      return SkinTextures.DEFAULT_9;
  }
  throw Error("what u doing");
};

//
export const DefaultTextureConfig: DefaultTextureConfigType = {
  [SkinTextures.HIT_CIRCLE]: {
    filePrefix: "hitcircle",
  },
  [SkinTextures.APPROACH_CIRCLE]: {
    filePrefix: "approachcircle",
  },
  [SkinTextures.HIT_CIRCLE_OVERLAY]: {
    filePrefix: "hitcircleoverlay",
    animationFrameRate: 2, // max 4FPS (see notes)
  },
  [SkinTextures.SLIDER_BALL]: {
    filePrefix: "sliderb",
    // In McOsu/OsuSkin.cpp: m_sliderb->setAnimationFramerate(/*45.0f*/ 50.0f);
    animationFrameRate: 50,
    skipHyphen: true,
  },
  [SkinTextures.SLIDER_REPEAT]: {
    filePrefix: "reversearrow",
  },
  [SkinTextures.SLIDER_TICK]: {
    filePrefix: "sliderscorepoint",
  },
  [SkinTextures.SLIDER_FOLLOW_CIRCLE]: {
    filePrefix: "sliderfollowcircle",
    animationFrameRate: TO_BE_DECIDED_BY_SKIN_INI,
  },

  // TODO: Some spinner elements have restricted versions

  [SkinTextures.DEFAULT_0]: defaultNumberConfig(0),
  [SkinTextures.DEFAULT_1]: defaultNumberConfig(1),
  [SkinTextures.DEFAULT_2]: defaultNumberConfig(2),
  [SkinTextures.DEFAULT_3]: defaultNumberConfig(3),
  [SkinTextures.DEFAULT_4]: defaultNumberConfig(4),
  [SkinTextures.DEFAULT_5]: defaultNumberConfig(5),
  [SkinTextures.DEFAULT_6]: defaultNumberConfig(6),
  [SkinTextures.DEFAULT_7]: defaultNumberConfig(7),
  [SkinTextures.DEFAULT_8]: defaultNumberConfig(8),
  [SkinTextures.DEFAULT_9]: defaultNumberConfig(9),

  [SkinTextures.COMBO_0]: defaultScoreConfig(0),
  [SkinTextures.COMBO_1]: defaultScoreConfig(1),
  [SkinTextures.COMBO_2]: defaultScoreConfig(2),
  [SkinTextures.COMBO_3]: defaultScoreConfig(3),
  [SkinTextures.COMBO_4]: defaultScoreConfig(4),
  [SkinTextures.COMBO_5]: defaultScoreConfig(5),
  [SkinTextures.COMBO_6]: defaultScoreConfig(6),
  [SkinTextures.COMBO_7]: defaultScoreConfig(7),
  [SkinTextures.COMBO_8]: defaultScoreConfig(8),
  [SkinTextures.COMBO_9]: defaultScoreConfig(9),

  // Technically speaking it is defined by the skin.ini config.
  [SkinTextures.HIT_CIRCLE_0]: defaultNumberConfig(0),
  [SkinTextures.HIT_CIRCLE_1]: defaultNumberConfig(1),
  [SkinTextures.HIT_CIRCLE_2]: defaultNumberConfig(2),
  [SkinTextures.HIT_CIRCLE_3]: defaultNumberConfig(3),
  [SkinTextures.HIT_CIRCLE_4]: defaultNumberConfig(4),
  [SkinTextures.HIT_CIRCLE_5]: defaultNumberConfig(5),
  [SkinTextures.HIT_CIRCLE_6]: defaultNumberConfig(6),
  [SkinTextures.HIT_CIRCLE_7]: defaultNumberConfig(7),
  [SkinTextures.HIT_CIRCLE_8]: defaultNumberConfig(8),
  [SkinTextures.HIT_CIRCLE_9]: defaultNumberConfig(9),

  [SkinTextures.HIT_0]: {
    filePrefix: "hit0",
    animationFrameRate: 60,
  },
  [SkinTextures.HIT_50]: {
    filePrefix: "hit50",
    animationFrameRate: 60,
  },
  [SkinTextures.HIT_100]: {
    filePrefix: "hit100",
    animationFrameRate: 60,
  },
  [SkinTextures.HIT_100K]: {
    filePrefix: "hit100k",
    animationFrameRate: 60,
  },
  [SkinTextures.HIT_300]: {
    filePrefix: "hit300",
    animationFrameRate: 60,
  },
  [SkinTextures.HIT_300K]: {
    filePrefix: "hit300k",
    animationFrameRate: 60,
  },
  [SkinTextures.CURSOR]: {
    filePrefix: "cursor",
  },
  [SkinTextures.CURSOR_TRAIL]: {
    filePrefix: "cursortrail",
  },
  [SkinTextures.SPINNER_APPROACH_CIRCLE]: {
    // Element is positioned around 397px vertically
    // Applied to old and new style
    filePrefix: "spinner-approachcircle",
  },
  [SkinTextures.SPINNER_RPM]: {
    /*
    Origin: TopLeft
    This element is positioned at 139px to the left from the middle of the screen and at 712px height
(373,712) at 1024x768
(544,712) at 1366x768
     */
    filePrefix: "spinner-rpm",
  },

  [SkinTextures.SPINNER_CLEAR]: {
    // Position around 230px vertically
    // Shown, when player has fulfilled the spinner
    filePrefix: "spinner-clear",
  },
  [SkinTextures.SPINNER_SPIN]: {
    // Positioned around 582px vertically
    // Appears at the start of the spinner
    filePrefix: "spinner-spin",
  },
  [SkinTextures.SPINNER_GLOW]: {
    filePrefix: "spinner-glow",
  },
  [SkinTextures.SPINNER_BOTTOM]: {
    filePrefix: "spinner-bottom",
  },
  [SkinTextures.SPINNER_TOP]: {
    filePrefix: "spinner-top",
  },
  [SkinTextures.SPINNER_MIDDLE2]: {
    filePrefix: "spinner-middle2",
  },
  [SkinTextures.SPINNER_MIDDLE]: {
    filePrefix: "spinner-middle",
  },

  // Spinner (old)
  // spinner-background, circle, metre, osu
};
