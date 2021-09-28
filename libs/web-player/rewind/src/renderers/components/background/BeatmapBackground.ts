import { Sprite, Texture } from "pixi.js";
import { BlurFilter } from "@pixi/filter-blur";

import { injectable, postConstruct } from "inversify";
import { BeatmapBackgroundSettingsStore } from "../../../services/BeatmapBackgroundSettingsStore";
import { BeatmapBackgroundSettings } from "../../../settings/BeatmapBackgroundSettings";
import { STAGE_WIDTH } from "../../constants";

const MAX_BLUR_STRENGTH = 15;

/**
 * Can be thought of a smart component while the `background: Sprite` is the dumb component.
 * Is connected to a background settings store
 */
@injectable()
export class BeatmapBackground {
  public sprite: Sprite;

  constructor(private readonly settingsStore: BeatmapBackgroundSettingsStore) {
    this.sprite = new Sprite(); // No pooling needed
  }

  @postConstruct()
  init() {
    this.settingsStore.settings$.subscribe((s) => this.onSettingsChange(s));
    this.settingsStore.texture$.subscribe((t) => this.onTextureChange(t));
  }

  private onSettingsChange(beatmapBackgroundSettings: BeatmapBackgroundSettings) {
    const { enabled, dim, blur } = beatmapBackgroundSettings;
    this.sprite.alpha = 1.0 - dim;
    this.sprite.filters = [new BlurFilter(blur * MAX_BLUR_STRENGTH)];
    this.sprite.renderable = enabled;
  }

  private onTextureChange(texture: Texture) {
    this.sprite.texture = texture;
    const scaling = STAGE_WIDTH / texture.width;
    this.sprite.scale.set(scaling, scaling);
  }
}
