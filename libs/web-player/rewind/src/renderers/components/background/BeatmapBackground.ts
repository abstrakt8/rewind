import { Sprite } from "pixi.js";
import { BlurFilter } from "@pixi/filter-blur";

import { injectable, postConstruct } from "inversify";
import { TextureManager } from "../../../textures/TextureManager";
import { STAGE_WIDTH } from "../../constants";
import { BeatmapBackgroundSettingsStore } from "../../../services/BeatmapBackgroundSettingsStore";
import { BeatmapBackgroundSettings } from "../../../settings/BeatmapBackgroundSettings";

const MAX_BLUR_STRENGTH = 15;

// <BeatmapBackground/>
@injectable()
export class BeatmapBackground {
  private readonly background: Sprite;

  constructor(private textureManager: TextureManager, private readonly settingsStore: BeatmapBackgroundSettingsStore) {
    this.background = new Sprite();
  }

  @postConstruct()
  initialize() {
    this.settingsStore.settings$.subscribe(this.handleSettingsChange.bind(this));
  }

  private handleSettingsChange(beatmapBackgroundSettings: BeatmapBackgroundSettings) {
    const { enabled, dim, blur } = beatmapBackgroundSettings;
    this.background.alpha = 1.0 - dim;
    this.background.filters = [new BlurFilter(blur * MAX_BLUR_STRENGTH)];
    this.background.renderable = enabled;
  }

  getSprite() {
    return this.background;
  }

  update() {
    this.background.texture = this.textureManager.getTexture("BACKGROUND");
    const scaling = STAGE_WIDTH / this.background.texture.width;
    this.background.scale.set(scaling, scaling);
  }
}
