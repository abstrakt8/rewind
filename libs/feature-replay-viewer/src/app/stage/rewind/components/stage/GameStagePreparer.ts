import * as PIXI from "pixi.js";
import { BackgroundPreparer } from "../background/BackgroundPreparer";
import { injectable } from "inversify";
import { TheaterStagePreparer } from "../../../core/TheaterStagePreparer";
import { PlayfieldPreparer } from "../playfield/PlayfieldPreparer";
import { PixiRendererService } from "../../../core/PixiRendererService";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";

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
    this.stage = new PIXI.Container();
    this.stage.addChild(backgroundPreparer.getSprite(), playfieldPreparer.getContainer());
    this.stage.interactiveChildren = false;
    this.stage.interactive = false;
  }

  resizeTo() {
    const screen = this.rendererService.getRenderer()?.screen;
    if (!screen) {
      return; // Should not be possible
    }
    this.widthInPx = screen.width;
    this.heightInPx = screen.height;
    const scaling = this.getPlayfieldScaling();
    const playfield = this.playfieldPreparer.getContainer();
    playfield.scale.set(scaling);
    playfield.position.set(
      (this.widthInPx - OSU_PLAYFIELD_WIDTH * scaling) / 2,
      (this.heightInPx - OSU_PLAYFIELD_HEIGHT * scaling) / 2,
    );
  }

  prepare() {
    this.resizeTo();
    this.backgroundPreparer.prepare();
    this.playfieldPreparer.prepare();
    return this.stage;
  }

  /**
   *
   * @param paddingPercent how much padding to use 80% means that there is 10% on both sides is padded.
   */
  getPlayfieldScaling(paddingPercent = 0.8): number {
    if (this.widthInPx < this.heightInPx * (4 / 3)) {
      return (this.widthInPx * paddingPercent) / OSU_PLAYFIELD_WIDTH;
    } else {
      // It's almost always constrained by height
      // Maybe the other case will happen if the user is watching this on mobile in vertical mode.
      return (this.heightInPx * paddingPercent) / OSU_PLAYFIELD_HEIGHT;
    }
  }
}
