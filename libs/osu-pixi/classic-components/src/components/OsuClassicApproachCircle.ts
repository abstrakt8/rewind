import { Sprite } from "@pixi/sprite";
import { AnimationTimeSetting, ModHiddenSetting } from "../DrawableSettings";
import { PrepareSetting } from "../utils/Preparable";
import { Position } from "@rewind/osu/math";
import { Texture } from "pixi.js";
import {
  applyPropertiesToDisplayObject,
  createCenteredSprite,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { OsuClassicConstants } from "./OsuClassicConstants";
import { fadeInT, fadeOutT, scaleToT } from "../utils/Transformations";

export interface OsuClassicApproachCircleSettings extends AnimationTimeSetting, ModHiddenSetting {
  scale: number;
  position: Position;
  approachDuration: number;
  texture: Texture;
  tint: number;
}

// TODO: investigate (it was in McOsu)
const approachCircleMultiplier = 0.9;

const DEFAULT_SETTINGS: OsuClassicApproachCircleSettings = {
  time: 0,
  modHidden: false,
  approachDuration: 450, // AR10
  scale: 0.57, // CS4
  position: { x: 0, y: 0 },

  texture: Texture.EMPTY,
  tint: 0x111111,
};

export class OsuClassicApproachCircle implements PrepareSetting<OsuClassicApproachCircleSettings> {
  sprite: Sprite;
  settings: OsuClassicApproachCircleSettings;

  constructor(settings: Partial<OsuClassicApproachCircleSettings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.sprite = createCenteredSprite();
  }

  prepare(settings: Partial<OsuClassicApproachCircleSettings>): void {
    this.settings = { ...this.settings, ...settings };
    const { texture, tint } = this.settings;
    this.sprite.texture = texture;
    this.sprite.tint = tint;
    this.animate();
  }

  normalTransformation(): DisplayObjectTransformationProcess {
    const timeFadeIn = OsuClassicConstants.DEFAULT_FADE_IN_DURATION; // TODO: Check if correct
    const hitTime = 0;
    const { position, scale, approachDuration } = this.settings;
    const spawnTime = hitTime - approachDuration;

    const fadingDuration = Math.min(timeFadeIn * 2, approachDuration);

    // TODO: if hitResult, need fadeOut

    return {
      position: {
        startValue: position,
      },
      scale: {
        startValue: scale * 4,
        transformations: [{ time: [spawnTime, hitTime], func: scaleToT(scale * 1.0) }],
      },
      alpha: {
        startValue: 0,
        transformations: [
          { time: [spawnTime, spawnTime + fadingDuration], func: fadeInT() },
          { time: [hitTime, hitTime + 50], func: fadeOutT() },
        ],
      },
    };
  }

  hiddenTransformation(): DisplayObjectTransformationProcess {
    return {
      alpha: {
        startValue: 0,
      },
    };
  }

  animate(): void {
    const { modHidden, time, scale, position } = this.settings;
    const transformation = modHidden ? this.hiddenTransformation() : this.normalTransformation();
    const props = evaluateTransformationsToProperties(transformation, time, { scale, position });
    applyPropertiesToDisplayObject(props, this.sprite);
  }

  dispose(): void {
    return;
  }
}
