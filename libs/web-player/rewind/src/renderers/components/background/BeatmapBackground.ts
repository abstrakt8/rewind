import { Sprite } from "pixi.js";
import { BlurFilter } from "@pixi/filter-blur";

import { injectable } from "inversify";
import { TextureManager } from "../../../textures/TextureManager";
import { STAGE_WIDTH } from "../../constants";

const MAX_BLUR_STRENGTH = 15;

@injectable()
export class BeatmapBackground {
  private readonly background: Sprite;

  constructor(
    private textureManager: TextureManager, // private theaterViewService: StageViewSettingsService,
  ) {
    this.background = new Sprite();
    const blurScale = 0.5;
    this.background.filters = [new BlurFilter(blurScale * MAX_BLUR_STRENGTH)];

    // TODO
    const alphaScale = 0.2;
    this.background.alpha = alphaScale;
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
