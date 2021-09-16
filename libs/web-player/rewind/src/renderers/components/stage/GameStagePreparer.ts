import * as PIXI from "pixi.js";
import { BackgroundPreparer } from "../background/BackgroundPreparer";
import { injectable } from "inversify";
import { TheaterStagePreparer } from "../../../model/TheaterStagePreparer";
import { PlayfieldPreparer } from "../playfield/PlayfieldPreparer";
import { PixiRendererService } from "../../PixiRendererService";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";
import { ForegroundHUDPreparer } from "../hud/ForegroundHUDPreparer";

// The whole game stage will be in the virtual size 1024x768
//
// const STAGE_WIDTH = 1024;
// const STAGE_HEIGHT = 600;
export const STAGE_WIDTH = 1600;
export const STAGE_HEIGHT = 900;

const ratio = STAGE_WIDTH / STAGE_HEIGHT;

@injectable()
export class GameStagePreparer implements TheaterStagePreparer {
  private widthInPx = 0;
  private heightInPx = 0;

  private readonly stage: PIXI.Container;

  constructor(
    private rendererService: PixiRendererService,
    private backgroundPreparer: BackgroundPreparer,
    private playfieldPreparer: PlayfieldPreparer,
    private foregroundHUDPreparer: ForegroundHUDPreparer,
  ) {
    const background = backgroundPreparer.getSprite();
    const playfield = this.playfieldPreparer.getContainer();
    const foregroundHUD = this.foregroundHUDPreparer.container;

    this.stage = new PIXI.Container();
    this.stage.addChild(background, playfield, foregroundHUD);
    this.stage.interactiveChildren = false;
    this.stage.interactive = false;
    const playfieldScaling = (STAGE_HEIGHT * 0.8) / OSU_PLAYFIELD_HEIGHT;

    playfield.position.set(
      (STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2,
      (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT * playfieldScaling) / 2,
    );
    playfield.scale.set(playfieldScaling);
  }

  resizeTo() {
    const screen = this.rendererService.getRenderer()?.screen;
    // Should not be possible
    if (!screen) return;
    // Unchanged
    if (this.widthInPx === screen.width && this.heightInPx === screen.height) return;

    if (screen.width < screen.height * ratio) {
      this.widthInPx = screen.width;
      this.heightInPx = screen.width / ratio;
    } else {
      // That is usually the case that the height is the constraint
      this.widthInPx = screen.height * ratio;
      this.heightInPx = screen.height;
    }

    const scale = this.widthInPx / STAGE_WIDTH;
    this.stage.scale.set(scale, scale);
    this.stage.position.set((screen.width - this.widthInPx) / 2, (screen.height - this.heightInPx) / 2);
  }

  prepare() {
    this.resizeTo();
    this.backgroundPreparer.prepare();
    this.playfieldPreparer.prepare();
    this.foregroundHUDPreparer.prepare();
    return this.stage;
  }
}
