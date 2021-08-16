import { Sprite } from "pixi.js";
import { injectable } from "inversify";
import { TextureManager } from "../../TextureManager";
import { TheaterViewService } from "../../TheaterViewService";

@injectable()
export class BackgroundPreparer {
  private readonly background: Sprite;

  constructor(private textureManager: TextureManager, private theaterViewService: TheaterViewService) {
    this.background = new Sprite();
    this.background.anchor.set(0.5, 0.5);
  }

  getSprite() {
    return this.background;
  }

  prepare() {
    this.background.texture = this.textureManager.getTexture("BACKGROUND");
    this.background.alpha = this.theaterViewService.getView().backgroundDim;
    return this.background;
  }
}
