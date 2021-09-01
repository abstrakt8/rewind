import { Sprite, Texture } from "pixi.js";
import { inject, injectable } from "inversify";
import { StageViewService } from "../../StageViewService";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../stage/GameStagePreparer";
import type { RewindTextureMap } from "../../../types";
import { TYPES } from "../../../types";

@injectable()
export class BackgroundPreparer {
  private readonly background: Sprite;

  constructor(
    @inject(TYPES.TEXTURE_MAP) private textureMap: RewindTextureMap,
    private theaterViewService: StageViewService,
  ) {
    this.background = new Sprite();
    this.background.texture = textureMap.get("BACKGROUND") ?? Texture.EMPTY;
  }

  getSprite() {
    return this.background;
  }

  prepare() {
    // this.background.texture = this.textureManager.getTexture("BACKGROUND");
    this.background.width = STAGE_WIDTH;
    this.background.height = STAGE_HEIGHT;

    this.background.alpha = this.theaterViewService.getView().backgroundDim;
    return this.background;
  }
}
