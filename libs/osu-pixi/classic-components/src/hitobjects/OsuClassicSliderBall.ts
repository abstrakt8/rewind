import { PrepareSetting } from "../utils/Preparable";
import { Container, Sprite, Texture } from "pixi.js";
import { createCenteredSprite } from "../utils/Pixi";
import { PositionSetting, ScaleSetting } from "../DrawableSettings";

/**
 * Additional settings:
 * * timeSinceLostTrack
 * * timeSinceTracking
 * * ballRotation
 */
interface OsuClassicSliderBallSettings extends PositionSetting, ScaleSetting {
  followCircleTexture: Texture;
  ballTexture: Texture;
  ballTint: number | null;
}

const defaultSettings: OsuClassicSliderBallSettings = {
  followCircleTexture: Texture.EMPTY,
  ballTexture: Texture.EMPTY,
  ballTint: null,
  position: { x: 0, y: 0 },
  scale: 0.57, // cs4
};

/**
 * trackingStart
 * notTrackingStart
 *
 * just so we can get animations
 *
 */
export class OsuClassicSliderBall implements PrepareSetting<OsuClassicSliderBallSettings> {
  container: Container;
  followCircleSprite: Sprite;
  ballSprite: Sprite;

  private settings: OsuClassicSliderBallSettings;

  constructor() {
    this.container = new Container();
    this.followCircleSprite = createCenteredSprite();
    this.ballSprite = createCenteredSprite();
    this.settings = defaultSettings;

    this.container.addChild(this.ballSprite);
    this.container.addChild(this.followCircleSprite);
  }

  // TODO: Maybe move settings (and slider) to prepareFor ...
  prepare(setting: Partial<OsuClassicSliderBallSettings>): void {
    this.settings = { ...this.settings, ...setting };

    const { followCircleTexture, ballTexture, position, ballTint, scale } = this.settings;

    this.followCircleSprite.texture = followCircleTexture;
    this.ballSprite.texture = ballTexture;

    if (ballTint !== null) {
      this.ballSprite.tint = ballTint;
    }

    // If the ball is tracking it is 2.4 and alpha = 1
    // TODO: osu!magic^TM
    this.followCircleSprite.scale.set(1.2);
    this.container.position.set(position.x, position.y);
    this.container.alpha = 1.0;
    this.container.scale.set(scale);
  }
}
