import { Container, Sprite, Texture } from "pixi.js";
import { OsuClassicNumber } from "osu-canvas/lib/drawables/classic/OsuClassicNumber";
import { Skin } from "../skins/Skin";
import { ReplayStateTimeMachine } from "osu-lib";

// Default field size
export const OSU_PLAYFIELD_BASE_X = 512;
export const OSU_PLAYFIELD_BASE_Y = 384;

/**
 Contains elements in the following order (far to near):
 - Background: image or maybe story board in the future
 - Playfield: where the action happens
 - Stats UI: additional overlay for example Accuracy, UR, PP. Maybe we need a stats UI behind playfield layer
 because some elements like the UR bar get drawn behind the hit objects .
 */
export class MyExtendedPlayfieldContainer {
  widthInPx = 0;
  heightInPx = 0;

  container: Container;
  backgroundSprite: Sprite;
  playfield: Container;
  foregroundHUD: Container;
  skin: Skin;

  replayTimeMachine?: ReplayStateTimeMachine;

  // TODO: StatsContainer or similar

  constructor(playfield: Container) {
    this.container = new Container();
    this.foregroundHUD = new Container();
    // Texture will be given later
    this.backgroundSprite = new Sprite();
    this.backgroundSprite.anchor.set(0.5, 0.5);

    this.playfield = playfield;
    this.skin = Skin.EMPTY;

    this.container.addChild(this.backgroundSprite);
    this.container.addChild(this.playfield);
    this.container.addChild(this.foregroundHUD);
  }

  /**
   *
   * @param paddingPercent how much padding to use 80% means that there is 10% on both sides is padded.
   */
  getPlayfieldScaling(paddingPercent = 0.8): number {
    if (this.widthInPx < this.heightInPx * (4 / 3)) {
      return (this.widthInPx * paddingPercent) / OSU_PLAYFIELD_BASE_X;
    } else {
      // It's almost always constrained by height
      // Maybe the other case will happen if the user is watching this on mobile in vertical mode.
      return (this.heightInPx * paddingPercent) / OSU_PLAYFIELD_BASE_Y;
    }
  }

  resizeTo(widthInPx: number, heightInPx: number): void {
    this.widthInPx = widthInPx;
    this.heightInPx = heightInPx;

    this.backgroundSprite.position.set(this.widthInPx / 2, this.heightInPx / 2);
    const scaling = this.getPlayfieldScaling();
    this.playfield.scale.set(scaling);
    // Set it to the center
    this.playfield.position.set(
      (widthInPx - OSU_PLAYFIELD_BASE_X * scaling) / 2,
      (heightInPx - OSU_PLAYFIELD_BASE_Y * scaling) / 2
    );
  }

  // TODO: Background technically depends on the beatmap settings
  // Maybe use a Texture upon BaseTexture (using frame)
  setBackground(texture: Texture): void {
    this.backgroundSprite.texture = texture;
  }

  setBackgroundAlpha(alpha: number): void {
    this.backgroundSprite.alpha = alpha;
  }

  applyHud(currentCombo: number) {
    this.foregroundHUD.removeChildren();
    {
      const comboNumber = new OsuClassicNumber();
      const textures = this.skin.getComboNumberTextures();
      const overlap = this.skin.config.fonts.comboOverlap;
      comboNumber.prepare({ number: currentCombo, textures, overlap });
      comboNumber.position.set(200, 500);
      this.foregroundHUD.addChild(comboNumber);
    }
  }

  prepare(time: number) {
    const replayState = this.replayTimeMachine?.replayStateAt(time);
    if (replayState !== undefined) {
      this.applyHud(replayState.currentCombo);
    }
  }
}
