import { OsuSkinTextures } from "./TextureTypes";

export type OsuSkinTextureConfig = {
  filePrefix: string;
  animationFrameRate?: number;
  skipHyphen?: boolean; // Most of the animated textures use hyphen '-' , but some do not such as sliderb0.png.
};

export const TO_BE_DECIDED_BY_SKIN_INI = -1;
const defaultNumberConfig = (digit: number): OsuSkinTextureConfig => ({
  filePrefix: `default-${digit}`,
  // No animation possible
});
const defaultScoreConfig = (digit: number): OsuSkinTextureConfig => ({
  filePrefix: `score-${digit}`,
  // No animation possible
});

// https://osu.ppy.sh/wiki/en/Skinning/Interface (normal)
// https://osu.ppy.sh/wiki/el/Skinning/osu%21 (osu!std)
export const DEFAULT_SKIN_TEXTURE_CONFIG: Record<OsuSkinTextures, OsuSkinTextureConfig> = Object.freeze({
  HIT_CIRCLE: {
    filePrefix: "hitcircle",
  },
  APPROACH_CIRCLE: {
    filePrefix: "approachcircle",
  },
  HIT_CIRCLE_OVERLAY: {
    filePrefix: "hitcircleoverlay",
    animationFrameRate: 2, // max 4FPS (see notes)
  },
  SLIDER_BALL: {
    filePrefix: "sliderb",
    // In McOsu/OsuSkin.cpp: m_sliderb->setAnimationFramerate(/*45.0f*/ 50.0f);
    animationFrameRate: 50,
    skipHyphen: true,
  },
  SLIDER_REPEAT: {
    filePrefix: "reversearrow",
  },
  SLIDER_TICK: {
    filePrefix: "sliderscorepoint",
  },
  SLIDER_FOLLOW_CIRCLE: {
    filePrefix: "sliderfollowcircle",
    animationFrameRate: TO_BE_DECIDED_BY_SKIN_INI,
  },

  DEFAULT_0: defaultNumberConfig(0),
  DEFAULT_1: defaultNumberConfig(1),
  DEFAULT_2: defaultNumberConfig(2),
  DEFAULT_3: defaultNumberConfig(3),
  DEFAULT_4: defaultNumberConfig(4),
  DEFAULT_5: defaultNumberConfig(5),
  DEFAULT_6: defaultNumberConfig(6),
  DEFAULT_7: defaultNumberConfig(7),
  DEFAULT_8: defaultNumberConfig(8),
  DEFAULT_9: defaultNumberConfig(9),

  COMBO_0: defaultScoreConfig(0),
  COMBO_1: defaultScoreConfig(1),
  COMBO_2: defaultScoreConfig(2),
  COMBO_3: defaultScoreConfig(3),
  COMBO_4: defaultScoreConfig(4),
  COMBO_5: defaultScoreConfig(5),
  COMBO_6: defaultScoreConfig(6),
  COMBO_7: defaultScoreConfig(7),
  COMBO_8: defaultScoreConfig(8),
  COMBO_9: defaultScoreConfig(9),

  // Technically speaking it is defined by the skin.ini config.
  HIT_CIRCLE_0: defaultNumberConfig(0),
  HIT_CIRCLE_1: defaultNumberConfig(1),
  HIT_CIRCLE_2: defaultNumberConfig(2),
  HIT_CIRCLE_3: defaultNumberConfig(3),
  HIT_CIRCLE_4: defaultNumberConfig(4),
  HIT_CIRCLE_5: defaultNumberConfig(5),
  HIT_CIRCLE_6: defaultNumberConfig(6),
  HIT_CIRCLE_7: defaultNumberConfig(7),
  HIT_CIRCLE_8: defaultNumberConfig(8),
  HIT_CIRCLE_9: defaultNumberConfig(9),

  HIT_0: {
    filePrefix: "hit0",
    animationFrameRate: 60,
  },
  HIT_50: {
    filePrefix: "hit50",
    animationFrameRate: 60,
  },
  HIT_100: {
    filePrefix: "hit100",
    animationFrameRate: 60,
  },
  HIT_100K: {
    filePrefix: "hit100k",
    animationFrameRate: 60,
  },
  HIT_300: {
    filePrefix: "hit300",
    animationFrameRate: 60,
  },
  HIT_300K: {
    filePrefix: "hit300k",
    animationFrameRate: 60,
  },
  CURSOR: {
    filePrefix: "cursor",
  },
  CURSOR_TRAIL: {
    filePrefix: "cursortrail",
  },

  // TODO: Some spinner elements have restricted versions

  SPINNER_APPROACH_CIRCLE: {
    // Element is positioned around 397px vertically
    // Applied to old and new style
    filePrefix: "spinner-approachcircle",
  },
  SPINNER_RPM: {
    /*
    Origin: TopLeft
    This element is positioned at 139px to the left from the middle of the screen and at 712px height
(373,712) at 1024x768
(544,712) at 1366x768
     */
    filePrefix: "spinner-rpm",
  },

  SPINNER_CLEAR: {
    // Position around 230px vertically
    // Shown, when player has fulfilled the spinner
    filePrefix: "spinner-clear",
  },
  SPINNER_SPIN: {
    // Positioned around 582px vertically
    // Appears at the start of the spinner
    filePrefix: "spinner-spin",
  },
  SPINNER_GLOW: {
    filePrefix: "spinner-glow",
  },
  SPINNER_BOTTOM: {
    filePrefix: "spinner-bottom",
  },
  SPINNER_TOP: {
    filePrefix: "spinner-top",
  },
  SPINNER_MIDDLE2: {
    filePrefix: "spinner-middle2",
  },
  SPINNER_MIDDLE: {
    filePrefix: "spinner-middle",
  },
  SPINNER_OSU: {
    filePrefix: "spinner-osu",
  },
  SPINNER_BACKGROUND: {
    filePrefix: "spinner-background",
  },
  SPINNER_CIRCLE: {
    filePrefix: "spinner-circle",
  },

  SCORE_X: {
    filePrefix: "score-x",
  },
  SCORE_PERCENT: {
    filePrefix: "score-percent",
  },
  SCORE_DOT: {
    filePrefix: "score-dot",
  },
});
