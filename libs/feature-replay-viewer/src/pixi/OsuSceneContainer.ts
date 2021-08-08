import * as PIXI from "pixi.js";
import { Scene } from "../game/Scene";
import { PlayfieldContainer } from "./PlayfieldContainer";
import { ForegroundHUDContainer } from "./ForegroundHUDContainer";
import { Sprite, Texture } from "pixi.js";

export const OSU_PLAYFIELD_BASE_X = 512;
export const OSU_PLAYFIELD_BASE_Y = 384;

export class OsuSceneContainer {
  public stage: PIXI.Container;
  private backgroundUrlUsed = "";
  private background: Sprite;
  private playfield: PlayfieldContainer;
  private foregroundHUD: ForegroundHUDContainer;

  private widthInPx = 0;
  private heightInPx = 0;

  constructor(private readonly renderer: PIXI.Renderer) {
    this.stage = new PIXI.Container();
    this.playfield = new PlayfieldContainer(renderer);
    this.foregroundHUD = new ForegroundHUDContainer();
    this.background = new Sprite();

    this.stage.addChild(this.background, this.playfield.container, this.foregroundHUD.container);
  }

  prepare(scene: Scene) {
    this.prepareBackground(scene);
    this.foregroundHUD.prepare(scene);
    this.playfield.prepare(scene);
  }

  async prepareBackground(scene: Scene) {
    const { backgroundUrl, view } = scene;
    if (backgroundUrl !== this.backgroundUrlUsed) {
      // Not sure if that is bad
      this.background.texture = await Texture.fromURL(backgroundUrl);
      this.backgroundUrlUsed = backgroundUrl;
      console.log(`Using backgroundUrl=${backgroundUrl}`);
    }
    this.background.alpha = view.backgroundDim;
    this.background.anchor.set(0.5, 0.5);
  }

  resizeTo(widthInPx: number, heightInPx: number): void {
    this.widthInPx = widthInPx;
    this.heightInPx = heightInPx;
    this.foregroundHUD.resizeTo(widthInPx, heightInPx);

    this.background.position.set(this.widthInPx / 2, this.heightInPx / 2);
    const scaling = this.getPlayfieldScaling();
    this.playfield.container.scale.set(scaling);
    // Set it to the center
    this.playfield.container.position.set(
      (widthInPx - OSU_PLAYFIELD_BASE_X * scaling) / 2,
      (heightInPx - OSU_PLAYFIELD_BASE_Y * scaling) / 2,
    );
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
}
