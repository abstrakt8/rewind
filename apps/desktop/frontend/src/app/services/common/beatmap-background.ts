import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { Texture } from "pixi.js";
import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { JSONSchemaType } from "ajv";

export interface BeatmapBackgroundSettings {
  // Whether it should be rendered or not. Temporarily disabling with this flag gives a better UX than setting the dim
  // to 100% since the user can retain the old value.
  enabled: boolean;
  // A number between 0 and 1. The resulting blur strength equals `blur * MAX_BLUR_STRENGTH`.
  blur: number;
  // dim = 1 - alpha
  dim: number;
}

export const DEFAULT_BEATMAP_BACKGROUND_SETTINGS: BeatmapBackgroundSettings = Object.freeze({
  dim: 0.8,
  blur: 0.4,
  enabled: true,
});
export const BeatmapBackgroundSettingsSchema: JSONSchemaType<BeatmapBackgroundSettings> = {
  type: "object",
  properties: {
    dim: { type: "number", default: DEFAULT_BEATMAP_BACKGROUND_SETTINGS.dim },
    blur: { type: "number", default: DEFAULT_BEATMAP_BACKGROUND_SETTINGS.blur },
    enabled: { type: "boolean", default: DEFAULT_BEATMAP_BACKGROUND_SETTINGS.enabled },
  },
  required: [],
};

@injectable()
export class BeatmapBackgroundSettingsStore extends AbstractSettingsStore<BeatmapBackgroundSettings> {
  texture$: BehaviorSubject<Texture>;

  constructor() {
    super(DEFAULT_BEATMAP_BACKGROUND_SETTINGS);
    this.texture$ = new BehaviorSubject<Texture>(Texture.EMPTY);
  }

  get settings() {
    return this.settings$.getValue();
  }

  get texture() {
    return this.texture$.getValue();
  }

  setBlur(blur: number) {
    this.settings$.next({ ...this.settings, blur });
  }

  setDim(dim: number) {
    this.settings$.next({ ...this.settings, dim });
  }

  setEnabled(enabled: boolean) {
    this.settings$.next({ ...this.settings, enabled });
  }
}
