import * as PIXI from "pixi.js";
import { Container } from "pixi.js";
import { injectable } from "inversify";
import { PlayfieldPreparer } from "../playfield/PlayfieldPreparer";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";
import { ForegroundHUDPreparer } from "../hud/ForegroundHUDPreparer";
import { PixiRendererManager } from "../../PixiRendererManager";
import { BeatmapBackground } from "../background/BeatmapBackground";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";

const ratio = STAGE_WIDTH / STAGE_HEIGHT;

// This is a custom analysis stage that composes all the things it needs
// Other stages for example do not want a foreground HUD and should therefore compose differently.
@injectable()
export class AnalysisStagePreparer {
  private widthInPx = 0;
  private heightInPx = 0;

  public stage: Container;

  constructor(
    private rendererService: PixiRendererManager,
    private backgroundPreparer: BeatmapBackground,
    // private playfieldPreparer: PlayfieldPreparer,
    private foregroundHUDPreparer: ForegroundHUDPreparer,
  ) {
    const background = backgroundPreparer.getSprite();
    // const playfield = this.playfieldPreparer.getContainer();
    // const foregroundHUD = this.foregroundHUDPreparer.container;

    this.stage = new PIXI.Container();
    this.stage.addChild(background, foregroundHUDPreparer.container);
    // this.stage.addChild(background, playfield, foregroundHUD);
    // this.stage.interactiveChildren = false;
    // this.stage.interactive = false;
    const playfieldScaling = (STAGE_HEIGHT * 0.8) / OSU_PLAYFIELD_HEIGHT;

    // playfield.position.set(
    //   (STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2,
    //   (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT * playfieldScaling) / 2,
    // );
    // playfield.scale.set(playfieldScaling);
  }

  /**
   *  So the virtual screen is supposed to have the dimensions 1600x900.
   */
  resizeTo() {
    if (!this.rendererService.resizeRendererToCanvasSize()) return;

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
    console.log(`Resizing screen.dimensions = ${screen.width} x ${screen.height}, scale = ${scale}`);
  }

  update() {
    this.resizeTo();
    this.backgroundPreparer.update();
    // this.playfieldPreparer.prepare();
    this.foregroundHUDPreparer.update();
  }

  destroy(): void {
    // Do nothing
  }
}
