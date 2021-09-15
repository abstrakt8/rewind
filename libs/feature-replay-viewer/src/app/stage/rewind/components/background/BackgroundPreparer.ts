import { Sprite, Texture } from "pixi.js";
import { inject, injectable } from "inversify";
import { StageViewService } from "../../StageViewService";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../stage/GameStagePreparer";
import type { RewindTextureMap } from "../../../STAGE_TYPES";
import { STAGE_TYPES } from "../../../STAGE_TYPES";

@injectable()
export class BackgroundPreparer {
  private readonly background: Sprite;

  constructor(
    @inject(STAGE_TYPES.TEXTURE_MAP) private textureMap: RewindTextureMap,
    private theaterViewService: StageViewService,
  ) {
    this.background = new Sprite();
    this.background.texture = textureMap.get("BACKGROUND") ?? Texture.EMPTY;
  }

  getSprite() {
    return this.background;
  }

  prepare() {
    const scaling = STAGE_WIDTH / this.background.texture.width;
    this.background.scale.set(scaling, scaling);

    this.background.alpha = this.theaterViewService.getView().backgroundDim;
    return this.background;
  }
}
