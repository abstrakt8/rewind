import { Sprite, Texture } from "pixi.js";
import { BlurFilter } from "@pixi/filter-blur";

import { injectable } from "inversify";
import { BeatmapBackgroundSettings, BeatmapBackgroundSettingsStore } from "../../../common/beatmap-background";

const MAX_BLUR_STRENGTH = 15;

interface Dimensions {
  width: number;
  height: number;
}

export class BeatmapBackground {
  public sprite: Sprite;

  constructor(private readonly stageDimensions: Dimensions) {
    this.sprite = new Sprite(); // No pooling needed
  }

  onSettingsChange(beatmapBackgroundSettings: BeatmapBackgroundSettings) {
    const { enabled, dim, blur } = beatmapBackgroundSettings;
    this.sprite.alpha = 1.0 - dim;
    this.sprite.filters = [new BlurFilter(blur * MAX_BLUR_STRENGTH)];
    this.sprite.renderable = enabled;
  }

  onTextureChange(texture: Texture) {
    this.sprite.texture = texture;
    // TODO: STAGE_WIDTH is kinda hardcoded
    const scaling = this.stageDimensions.width / texture.width;
    this.sprite.scale.set(scaling, scaling);
  }
}

@injectable()
export class BeatmapBackgroundFactory {
  constructor(private readonly settingsStore: BeatmapBackgroundSettingsStore) {}

  createBeatmapBackground(stageDimensions: Dimensions) {
    const beatmapBackground = new BeatmapBackground(stageDimensions);
    this.settingsStore.settings$.subscribe((s) => beatmapBackground.onSettingsChange(s));
    this.settingsStore.texture$.subscribe((t) => beatmapBackground.onTextureChange(t));
    return beatmapBackground;
  }
}
