// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
type Digit = typeof digits[number];
type DefaultDigitFont = `DEFAULT_${Digit}`;
type ScoreDigitFont = `SCORE_${Digit}`;
type ComboDigitFont = `COMBO_${Digit}`;
type HitCircleDigitFont = `HITCIRCLE_${Digit}`;
type HitCircleTextures = "APPROACH_CIRCLE" | "HIT_CIRCLE" | "HIT_CIRCLE_OVERLAY";
type SliderTextures = "SLIDER_BALL" | "SLIDER_FOLLOW_CIRCLE" | "SLIDER_TICK" | "SLIDER_REPEAT";
type SpinnerTextures =
  | "SPINNER_APPROACH_CIRCLE"
  | "SPINNER_BACKGROUND"
  | "SPINNER_BOTTOM"
  | "SPINNER_CIRCLE"
  | "SPINNER_CLEAR"
  | "SPINNER_GLOW"
  | "SPINNER_MIDDLE2"
  | "SPINNER_MIDDLE"
  | "SPINNER_OSU"
  | "SPINNER_RPM"
  | "SPINNER_SPIN"
  | "SPINNER_TOP";
type JudgementTextures = "HIT0" | "HIT50" | "HIT100" | "HIT100K" | "HIT300" | "HIT300K";
type CursorTextures = "CURSOR" | "CURSOR_TRAIL";
export type OsuSkinTextures =
  | HitCircleTextures
  | SliderTextures
  | SpinnerTextures
  | JudgementTextures
  | CursorTextures
  | DefaultDigitFont
  | ScoreDigitFont
  | ComboDigitFont
  | HitCircleDigitFont;

// export const isHitCircleFont = (h: OsuSkinTextures) : h is HitCircleDigitFont =>
