import { Sprite } from "@pixi/sprite";
import {
  applyPropertiesToDisplayObject,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { Easing, Position } from "@rewind/osu/math";
import { fadeInT, fadeOutT } from "../utils/Transformations";
import { PrepareSetting } from "../utils/Preparable";
import { Container, Texture } from "pixi.js";
import { AnimationTimeSetting, ModHiddenSetting } from "../DrawableSettings";
import { OsuClassicConstants } from "./OsuClassicConstants";

export interface SliderBodySettings extends AnimationTimeSetting, ModHiddenSetting {
  approachDuration: number;
  position: Position;
  duration: number;
  texture: Texture;
  headPositionInRectangle: Position;
}

const defaultSliderBodySetting: SliderBodySettings = {
  time: 0,
  approachDuration: 450, // AR10
  position: { x: 0, y: 0 },
  headPositionInRectangle: { x: 0, y: 0 },
  modHidden: false,
  duration: 0,
  texture: Texture.EMPTY,
};

/**
 * Basically just a sprite that can animate according to the settings.
 *
 * The slider body texture has to be calculated.
 */
export class OsuClassicSliderBody implements PrepareSetting<SliderBodySettings> {
  container: Container;
  sprite: Sprite;
  settings: SliderBodySettings;

  constructor() {
    this.settings = defaultSliderBodySetting;
    this.container = new Container();
    this.container.addChild((this.sprite = new Sprite()));
  }

  static transformation(settings: {
    approachDuration: number;
    position: Position;
    modHidden: boolean;
    duration: number;
  }): DisplayObjectTransformationProcess {
    const timeFadeIn = 400;
    const { approachDuration, modHidden, position, duration } = settings;

    const startTime = 0;
    const endTime = duration;
    const appearanceTime = startTime - approachDuration;

    const defaultTransforms: DisplayObjectTransformationProcess = {
      scale: { startValue: 1.0 },
      position: { startValue: position },
    };
    if (modHidden) {
      const hiddenFadeInDuration = approachDuration * OsuClassicConstants.fadeInDurationMultiplier;
      return {
        ...defaultTransforms,
        alpha: {
          startValue: 0.0,
          transformations: [
            { time: [appearanceTime, appearanceTime + hiddenFadeInDuration], func: fadeInT() },
            { time: [appearanceTime + hiddenFadeInDuration, endTime], func: fadeOutT() },
          ],
        },
      };
    } else {
      // Lazer specific
      const fadeOutTime = 450;
      return {
        ...defaultTransforms,
        alpha: {
          startValue: 0.0,
          transformations: [
            { time: [appearanceTime, appearanceTime + timeFadeIn], func: fadeInT() },
            { time: [endTime, endTime + fadeOutTime], func: fadeOutT(0, Easing.OUT_QUINT) },
          ],
        },
      };
    }
  }

  prepare(settings: Partial<SliderBodySettings>): void {
    this.settings = Object.freeze({ ...this.settings, ...settings });

    const { time, modHidden, position, approachDuration, duration, texture, headPositionInRectangle } = this.settings;

    const t = OsuClassicSliderBody.transformation({ modHidden, duration, position, approachDuration });
    const props = evaluateTransformationsToProperties(t, time);
    applyPropertiesToDisplayObject(props, this.container);
    this.sprite.texture = texture;
    this.sprite.position.set(-headPositionInRectangle.x, -headPositionInRectangle.y);

    // This is the most stupid caching
    // if (!this.sprite.texture.valid)
    //   this.sliderTextureManager.registerJob({
    //     borderColor,
    //     points,
    //     radius,
    //     sprite: this.sprite,
    //   });
  }
}
