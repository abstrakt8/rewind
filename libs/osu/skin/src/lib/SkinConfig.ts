// https://osu.ppy.sh/community/forums/topics/533940

// https://osu.ppy.sh/wiki/el/Skinning/skin.ini
// Either RGB or RGBA
export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type Color = RGB | RGBA;

export type SkinConfig = {
  general: {
    name: string;
    author: string;
    version: string;
    animationFrameRate: number | undefined;
    allowSliderBallTint: boolean;
    comboBurstRandom: boolean;
    cursorCenter: boolean;
    cursorExpand: boolean;
    cursorRotate: boolean;
    cursorTrailRotate: boolean;
    customComboBurstSounds: number[];
    hitCircleOverlayAboveNumber: boolean;
    layeredHitSounds: boolean;
    sliderBallFlip: boolean;
    spinnerFadePlayfield: boolean;
    spinnerFrequencyModulate: boolean;
    spinnerNoBlink: boolean;
    // sliderStyle is mentioned somewhere, but IDK what it stands for
  };
  // Technically speaking it's only RGB (but we also allow RGBA)
  colors: {
    comboColors: Color[];
    inputOverlayText: Color;
    menuGlow: Color;
    sliderBall: Color;
    sliderBorder: Color;
    sliderTrackOverride: Color | undefined;
    songSelectActiveText: Color;
    songSelectInactiveText: Color;
    spinnerBackground: Color;
    starBreakAdditive: Color;
  };
  fonts: {
    // Regarding overlap: Negative integers add a gap
    hitCirclePrefix: string;
    hitCircleOverlap: number;
    scorePrefix: string;
    scoreOverlap: number;
    comboPrefix: string;
    comboOverlap: number;
  };
  // CTB and Mania not supported
};

export enum SkinIniSection {
  NONE,
  GENERAL,
  COLORS,
  FONTS,
}

// Using the default settings from https://osu.ppy.sh/wiki/el/Skinning/skin.ini
export const generateDefaultSkinConfig = (didFileExist: boolean): SkinConfig => ({
  general: {
    name: "",
    author: "",
    // If skin.ini is not present, `latest` will be used
    // Otherwise 1.0 is assumed if version wasn't specified
    version: didFileExist ? "1.0" : "latest",
    animationFrameRate: undefined,
    allowSliderBallTint: false,
    comboBurstRandom: false,
    cursorCenter: true, // anchor = center
    cursorExpand: true,
    cursorRotate: true,
    cursorTrailRotate: true,
    customComboBurstSounds: [],
    hitCircleOverlayAboveNumber: true,
    layeredHitSounds: true,
    sliderBallFlip: true,
    spinnerFadePlayfield: false,
    spinnerFrequencyModulate: true,
    spinnerNoBlink: false,
  },
  colors: {
    comboColors: [
      [255, 192, 0],
      [0, 202, 0],
      [18, 124, 255],
      [242, 24, 57],
    ],
    inputOverlayText: [0, 0, 0],
    menuGlow: [0, 78, 155],
    sliderBall: [2, 170, 255],
    sliderBorder: [255, 255, 255],
    sliderTrackOverride: undefined, // this means to "use current combo color"
    songSelectActiveText: [0, 0, 0],
    songSelectInactiveText: [255, 255, 255],
    spinnerBackground: [100, 100, 100],
    starBreakAdditive: [255, 182, 193],
  },
  fonts: {
    hitCirclePrefix: "default",
    hitCircleOverlap: -2,
    scorePrefix: "score",
    scoreOverlap: -2,
    comboPrefix: "score",
    comboOverlap: -2,
  },
});
