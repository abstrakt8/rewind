import { Sprite, Texture } from "pixi.js";
import {
  createCenteredSprite,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { AnimationTimeSetting, HitResult, PositionSetting, ScaleSetting } from "../DrawableSettings";
import { PrepareSetting } from "../utils/Preparable";
import { fadeInT, fadeOutT, scaleToT, Transformation } from "../utils/Transformations";
import { Easing } from "@rewind/osu/math";

interface OsuClassicSliderRepeatSettings extends PositionSetting, ScaleSetting, AnimationTimeSetting {
  time: number;
  texture: Texture;
  rotationAngle: number;
  // When it should start fading in and "beating"
  approachDuration: number;
  // In Lazer it is Math.min(300, SpanDuration), might also be known as `animDuration`
  fadeInOutDuration: number;
  beatLength: number;
  hit: boolean | null;
}

const defaultSettings: OsuClassicSliderRepeatSettings = {
  time: 0,
  scale: 0.57, // cs4
  position: { x: 0, y: 0 },
  texture: Texture.EMPTY,
  rotationAngle: 0,
  approachDuration: 450,
  fadeInOutDuration: 300,
  hit: null,
  beatLength: 500, // 120bpm
};

/**
 * A bit simplified version of the osu!lazer one. No offset
 *
 * The actual animation has a really complicated logic, for more reading resources refer to those osu!lazer files:
 * * BeatSyncedContainer.cs
 * * ReverseArrowPiece.cs
 * * SliderEndCircle.cs
 * * DrawableSliderRepeat.cs
 */
export class OsuClassicSliderRepeat implements PrepareSetting<OsuClassicSliderRepeatSettings> {
  sprite: Sprite;
  settings: OsuClassicSliderRepeatSettings;

  constructor() {
    this.sprite = createCenteredSprite();
    this.settings = defaultSettings;
  }

  static normalTransformation(settings: {
    hit: boolean | null;
    scale: number;
    approachDuration: number;
    fadeInOutDuration: number;
    beatLength: number;
  }): DisplayObjectTransformationProcess {
    const { hit, scale, approachDuration, fadeInOutDuration, beatLength } = settings;

    // So it's actually inaccurate for higher BPMs (>300) but shouldn't really be visible with the eye
    const usedBeatLength = Math.min(beatLength, 200);
    const scalingTransformations: Transformation<number>[] = [];
    // hitTiming CAN ONLY BE at 0.
    const hitTiming = 0;
    // This might be slow for higher approach durations (such as -infinity AR)
    let t = -approachDuration;
    while (t < hitTiming) {
      scalingTransformations.push({ time: [t, t + usedBeatLength - 1], func: scaleToT(1.0 * scale, Easing.OUT) });
      // TODO That's not really clean to set the scale instantly to 1.3
      scalingTransformations.push({ time: [t + usedBeatLength - 1, t], func: scaleToT(1.3 * scale, Easing.OUT) });
      t += usedBeatLength;
    }

    const alphaTransformations: Transformation<number>[] = [
      {
        time: [-approachDuration, -approachDuration + fadeInOutDuration],
        func: fadeInT(),
      },
    ];

    if (hit !== null) {
      if (hit) {
        alphaTransformations.push({ time: [hitTiming, hitTiming + fadeInOutDuration], func: fadeOutT() });
      } else {
        alphaTransformations.push({
          time: [hitTiming, hitTiming + fadeInOutDuration],
          func: fadeOutT(0, Easing.OUT),
        });
      }
    }

    return {
      alpha: {
        startValue: 0,
        transformations: alphaTransformations,
      },
      scale: {
        startValue: 1.3 * scale,
        transformations: scalingTransformations,
      },
    };
  }

  prepare(setting: Partial<OsuClassicSliderRepeatSettings>): void {
    this.settings = { ...this.settings, ...setting };
    const { rotationAngle, texture, position, scale, hit, fadeInOutDuration, approachDuration, beatLength, time } =
      this.settings;

    this.sprite.anchor.set(0.5);
    this.sprite.texture = texture;
    this.sprite.position.set(position.x, position.y);
    this.sprite.rotation = rotationAngle;

    const props = evaluateTransformationsToProperties(
      OsuClassicSliderRepeat.normalTransformation({
        approachDuration,
        beatLength,
        fadeInOutDuration,
        hit,
        scale,
      }),
      time,
    );

    this.sprite.alpha = props.alpha as number;
    this.sprite.scale.set(props.scale as number);
  }
}
