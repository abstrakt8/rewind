import * as PIXI from "pixi.js";
import { Container } from "pixi.js";
import { injectable } from "inversify";
import { Playfield, PlayfieldFactory } from "../playfield/PlayfieldFactory";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "@rewind/osu/core";
import { ForegroundHUDPreparer } from "../hud/ForegroundHUDPreparer";
import { PixiRendererManager } from "../../PixiRendererManager";
import { BeatmapBackgroundFactory } from "../background/BeatmapBackground";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import { KeyPressWithNoteSheetPreparer } from "../keypresses/KeyPressOverlay";

const ratio = STAGE_WIDTH / STAGE_HEIGHT;
const showNoteKeyOverlay = true;

// This is a custom analysis stage that composes all the things it needs
// Other stages for example do not want a foreground HUD and should therefore compose differently.
@injectable()
export class AnalysisStage {
  private screenWidth = 0;
  private screenHeight = 0;

  public stage: Container;
  private playfield: Playfield;

  constructor(
    private rendererManager: PixiRendererManager,
    private beatmapBackground: BeatmapBackgroundFactory,
    private playfieldFactory: PlayfieldFactory,
    private foregroundHUDPreparer: ForegroundHUDPreparer,
    private keyPressOverlayPreparer: KeyPressWithNoteSheetPreparer,
  ) {
    const width = STAGE_WIDTH;
    const height = STAGE_HEIGHT;
    const background = beatmapBackground.createBeatmapBackground({ width, height });
    this.playfield = playfieldFactory.createPlayfield();

    this.stage = new PIXI.Container();
    this.stage.addChild(
      background.sprite,
      this.playfield.container,
      this.foregroundHUDPreparer.container,
      this.keyPressOverlayPreparer.container,
    );

    // Optimization
    this.playfield.container.interactiveChildren = false;

    let playfieldScaling;
    const overlayHeight = 0.1;

    if (showNoteKeyOverlay) {
      playfieldScaling = (STAGE_HEIGHT * 0.7) / OSU_PLAYFIELD_HEIGHT;
      this.playfield.container.position.set(
        (STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2,
        (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT * playfieldScaling) / 2 + OSU_PLAYFIELD_HEIGHT * overlayHeight,
      );
    } else {
      playfieldScaling = (STAGE_HEIGHT * 0.8) / OSU_PLAYFIELD_HEIGHT;
      this.playfield.container.position.set(
        (STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2,
        (STAGE_HEIGHT - OSU_PLAYFIELD_HEIGHT * playfieldScaling) / 2,
      );
    }

    this.keyPressOverlayPreparer.container.position.set((STAGE_WIDTH - OSU_PLAYFIELD_WIDTH * playfieldScaling) / 2, 15);
    this.keyPressOverlayPreparer.container.visible = showNoteKeyOverlay;

    this.playfield.container.scale.set(playfieldScaling);
  }

  /**
   *  So the virtual screen is supposed to have the dimensions 1600x900.
   */
  resizeTo() {
    const screen = this.rendererManager.getRenderer()?.screen;
    // Should not be possible
    if (!screen) return;
    // Using caching to check if unchanged
    if (this.screenWidth === screen.width && this.screenHeight === screen.height) return;
    [this.screenWidth, this.screenHeight] = [screen.width, screen.height];

    let widthInPx, heightInPx;
    // Determines whether we will have black stripes vertically or horizontally
    if (screen.width < screen.height * ratio) {
      widthInPx = screen.width;
      heightInPx = screen.width / ratio;
    } else {
      // That is usually the case that the height is the constraint
      widthInPx = screen.height * ratio;
      heightInPx = screen.height;
    }

    const scale = widthInPx / STAGE_WIDTH;
    this.stage.scale.set(scale, scale);
    this.stage.position.set((screen.width - widthInPx) / 2, (screen.height - heightInPx) / 2);
    console.debug(`Resizing screen.dimensions = ${screen.width} x ${screen.height}, scale = ${scale}`);
  }

  updateAnalysisStage() {
    // Maybe resizing should also be push based (with some debouncing)
    this.resizeTo();
    this.playfield.updatePlayfield();
    this.foregroundHUDPreparer.updateHUD();
    this.keyPressOverlayPreparer.update();
  }

  destroy(): void {
    // Do nothing
  }
}
