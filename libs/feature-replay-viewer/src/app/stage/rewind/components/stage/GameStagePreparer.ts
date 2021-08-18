import * as PIXI from "pixi.js";
import { BackgroundPreparer } from "../background/BackgroundPreparer";
import { injectable } from "inversify";
import { TheaterStagePreparer } from "../../../core/TheaterStagePreparer";
import { PlayfieldPreparer } from "../playfield/PlayfieldPreparer";
import { PixiRendererService } from "../../../core/PixiRendererService";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";

// The whole game stage will be in the virtual size 1024x768
//
// const STAGE_WIDTH = 1024;
// const STAGE_HEIGHT = 600;
export const STAGE_WIDTH = 854;
export const STAGE_HEIGHT = 480;

const ratio = STAGE_WIDTH / STAGE_HEIGHT;

/**
 * @param paddingPercent how much padding to use 80% means that there is 10% on both sides is padded.
 */
function getPlayfieldScaling(screenWidth: number, screenHeight: number, paddingPercent = 0.8): number {
  // screenHeight * (4/3) would be the screen width if we set the size to screenHeight
  if (screenWidth < screenHeight * (STAGE_WIDTH / STAGE_HEIGHT)) {
    return (screenWidth * paddingPercent) / OSU_PLAYFIELD_WIDTH;
  } else {
    // It's almost always constrained by height
    // Maybe the other case will happen if the user is watching this on mobile in vertical mode.
    return (screenHeight * paddingPercent) / OSU_PLAYFIELD_HEIGHT;
  }
}

@injectable()
export class GameStagePreparer implements TheaterStagePreparer {
  private widthInPx = 0;
  private heightInPx = 0;

  private readonly stage: PIXI.Container;

  constructor(
    private rendererService: PixiRendererService,
    private backgroundPreparer: BackgroundPreparer,
    private playfieldPreparer: PlayfieldPreparer,
  ) {
    const background = backgroundPreparer.getSprite();
    const playfield = this.playfieldPreparer.getContainer();

    this.stage = new PIXI.Container();
    this.stage.addChild(background, playfield);
    this.stage.interactiveChildren = false;
    this.stage.interactive = false;
    playfield.position.set((STAGE_WIDTH - OSU_PLAYFIELD_WIDTH) / 2, (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT) / 2);
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
    return this.stage;
  }
}
