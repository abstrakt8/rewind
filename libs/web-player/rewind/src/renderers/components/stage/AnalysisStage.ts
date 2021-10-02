import * as PIXI from "pixi.js";
import { Container } from "pixi.js";
import { injectable } from "inversify";
import { Playfield, PlayfieldFactory } from "../playfield/PlayfieldFactory";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";
import { ForegroundHUDPreparer } from "../hud/ForegroundHUDPreparer";
import { PixiRendererManager } from "../../PixiRendererManager";
import { BeatmapBackground, BeatmapBackgroundFactory } from "../background/BeatmapBackground";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";

const ratio = STAGE_WIDTH / STAGE_HEIGHT;

// This is a custom analysis stage that composes all the things it needs
// Other stages for example do not want a foreground HUD and should therefore compose differently.
@injectable()
export class AnalysisStage {
  private widthInPx = 0;
  private heightInPx = 0;

  public stage: Container;
  private playfield: Playfield;
  private foregroundHUD: Container;

  constructor(
    private rendererManager: PixiRendererManager,
    private beatmapBackground: BeatmapBackgroundFactory,
    private playfieldFactory: PlayfieldFactory,
    private foregroundHUDPreparer: ForegroundHUDPreparer,
  ) {
    const width = STAGE_WIDTH;
    const height = STAGE_HEIGHT;
    const background = beatmapBackground.createBeatmapBackground({ width, height });
    this.playfield = playfieldFactory.createPlayfield();
    this.foregroundHUD = this.foregroundHUDPreparer.container;

    this.stage = new PIXI.Container();
    this.stage.addChild(background.sprite, this.playfield.container, this.foregroundHUD);

    // Making them non interactive -> reduces lags when hovering because certain mouse events such as `onhover` don't
    // get fired and the tree traversal also stops about here.
    this.stage.interactiveChildren = false;
    this.stage.interactive = false;

    const playfieldScaling = (STAGE_HEIGHT * 0.8) / OSU_PLAYFIELD_HEIGHT;

    this.playfield.container.position.set(
      (STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2,
      (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT * playfieldScaling) / 2,
    );
    this.playfield.container.scale.set(playfieldScaling);
  }

  /**
   *  So the virtual screen is supposed to have the dimensions 1600x900.
   */
  resizeTo() {
    const screen = this.rendererManager.getRenderer()?.screen;
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
    console.debug(`Resizing screen.dimensions = ${screen.width} x ${screen.height}, scale = ${scale}`);
  }

  update() {
    // Maybe resizing should also be push based (with some debouncing)
    this.resizeTo();
    this.playfield.update();
    this.foregroundHUDPreparer.update();
  }

  destroy(): void {
    // Do nothing
  }
}
