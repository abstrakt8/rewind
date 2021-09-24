import { Sprite } from "pixi.js";
import { injectable } from "inversify";
import { TextureManager } from "../../../textures/TextureManager";
import { STAGE_WIDTH } from "../../constants";

@injectable()
export class BeatmapBackground {
  private readonly background: Sprite;

  constructor(
    private textureManager: TextureManager, // private theaterViewService: StageViewSettingsService,
  ) {
    this.background = new Sprite();
  }

  getSprite() {
    return this.background;
  }

  update() {
    const scaling = STAGE_WIDTH / this.background.texture.width;
    this.background.texture = this.textureManager.getTexture("BACKGROUND");
    console.log("Texture ", this.background.texture);
    this.background.scale.set(scaling, scaling);
    // TODO
    // this.background.alpha = this.theaterViewService.getView().backgroundDim;
  }
}
