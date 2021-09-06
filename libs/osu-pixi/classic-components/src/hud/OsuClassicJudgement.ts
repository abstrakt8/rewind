import { Texture, Sprite } from "pixi.js";
import { AnimationTimeSetting, PositionSetting, ScaleSetting } from "../DrawableSettings";
import { Easing, Position } from "@rewind/osu/math";
import { PrepareSetting } from "../utils/Preparable";
import {
  applyPropertiesToDisplayObject,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { fadeOutT, scaleToT } from "../utils/Transformations";
import { animationIndex } from "../utils/Animation";

export interface OsuClassicJudgementsSettings extends AnimationTimeSetting, PositionSetting, ScaleSetting {
  time: number;
  position: Position;
  scale: number;

  // Example: 60fps (16.6667ms each frame) and two textures given
  // At time=0ms texture[0], at 17ms texture[1] will be used at 34ms texture[1] will still be used since it's the last
  // one. In case there is no animation just provide a list of one texture.
  textures: Texture[];
  animationFrameRate: number;

  // TODO
  // Miss judgement has way different animation -> it slides down a bit.
  // In osu!lazer there is even a slight rotation
  // isMiss: boolean;
}

const defaultSettings: OsuClassicJudgementsSettings = {
  time: 0,
  position: { x: 0, y: 0 },
  scale: 0.57, // cs4
  textures: [Texture.EMPTY],
  animationFrameRate: 60,
};

//
/**
 * The judgements are sprites that represent Miss, 50, 100, 300, 100-genki, 300-genki.
 *
 * Animation starts at time=0 and should be included at the time when the has hit the circle or missed.
 */
export class OsuClassicJudgement implements PrepareSetting<OsuClassicJudgementsSettings> {
  sprite: Sprite;
  settings: OsuClassicJudgementsSettings;

  constructor() {
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.settings = defaultSettings;
  }

  // TODO: Miss animation
  static normalTransformation(scale: number, position: Position): DisplayObjectTransformationProcess {
    return {
      alpha: {
        startValue: 1,
        transformations: [{ time: [0, 1000], func: fadeOutT() }],
      },
      scale: {
        startValue: scale * 0.9,
        transformations: [{ time: [0, 500], func: scaleToT(scale * 1.0, Easing.OUT_ELASTIC) }],
      },
      position: {
        startValue: position,
      },
    };
  }

  prepare(setting: Partial<OsuClassicJudgementsSettings>) {
    this.settings = { ...this.settings, ...setting };

    const { position, scale, textures, time, animationFrameRate } = this.settings;

    // Last one will be taken in case there are none left...
    if (textures.length > 0) {
      const idx = Math.min(textures.length - 1, animationIndex(time, animationFrameRate));
      this.sprite.texture = textures[idx];
    } else {
      this.sprite.texture = Texture.EMPTY;
    }

    const props = evaluateTransformationsToProperties(OsuClassicJudgement.normalTransformation(scale, position), time);
    applyPropertiesToDisplayObject(props, this.sprite);
  }
}
