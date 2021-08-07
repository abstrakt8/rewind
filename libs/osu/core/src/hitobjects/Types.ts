import { Spinner } from "./Spinner";
import { HitCircle } from "./HitCircle";
import { Slider } from "./Slider";
import { SliderCheckPoint } from "./SliderCheckPoint";

export type HitObjectType = "HIT_CIRCLE" | "SLIDER" | "SPINNER";
export type SliderCheckPointType = "TICK" | "REPEAT" | "LAST_LEGACY_TICK";

// TODO: Change naming
export type MainHitObject = Spinner | HitCircle | Slider;
export type OsuHitObject = MainHitObject;
export type AllHitObjects = MainHitObject | SliderCheckPoint;

export const isHitCircle = (o: MainHitObject): o is HitCircle => o.type === "HIT_CIRCLE";
export const isSlider = (o: MainHitObject): o is Slider => o.type === "SLIDER";
export const isSpinner = (o: MainHitObject): o is Spinner => o.type === "SPINNER";
