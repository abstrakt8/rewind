import {
  applyPropertiesToDisplayObject,
  createCenteredSprite,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { Sprite, Texture } from "pixi.js";
import { Easing, Position } from "@rewind/osu/math";
import { fadeInT, fadeOutT } from "../utils/Transformations";

// Lazer/DrawableSliderTick.cs

interface SliderTickSettings {
  time: number;
  position: Position;
  scale: number;
  texture: Texture;
  approachDuration: number; // Has complicated logic
  hit?: boolean;
}

const ANIM_DURATION = 150;

export class OsuClassicSliderTick {
  public readonly sprite: Sprite;

  constructor() {
    this.sprite = createCenteredSprite();
  }

  static normalTransformation(settings: {
    approachDuration: number;
    hit: boolean;
  }): DisplayObjectTransformationProcess {
    const { approachDuration, hit } = settings;
    const hitTime = 0;
    return {
      alpha: {
        startValue: 0,
        transformations: [
          { time: [-approachDuration, -approachDuration + ANIM_DURATION], func: fadeInT() },
          // TODO: Depending on HIT
          hit
            ? { time: [hitTime, hitTime + ANIM_DURATION], func: fadeOutT(0, Easing.OUT_QUINT) }
            : { time: [hitTime, hitTime + ANIM_DURATION], func: fadeOutT(0) },
        ],
      },
    };
  }

  prepare(settings: SliderTickSettings): void {
    const { time, position, scale, texture, approachDuration, hit } = settings;

    this.sprite.texture = texture;
    this.sprite.position.set(position.x, position.y);
    this.sprite.scale.set(scale); // TODO: Actually it scales from 0.5 to 1.0

    const t = OsuClassicSliderTick.normalTransformation({ approachDuration, hit: hit ?? false });
    const p = evaluateTransformationsToProperties(t, time);
    applyPropertiesToDisplayObject(p, this.sprite);
  }
}
