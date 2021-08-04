import { Spinner } from "./Spinner";
import { Slider } from "./Slider";
import { HitCircle } from "./HitCircle";
import { SliderCheckPoint } from "./SliderCheckPoint";

export type OsuHitObject = Spinner | HitCircle | Slider;

export type MainHitObject = Spinner | HitCircle | Slider;

export type AllHitObjects = MainHitObject | SliderCheckPoint;
