import { Container } from "@pixi/display";
import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { OsuClassicNumber } from "./OsuClassicNumber";
import {
  applyPropertiesToDisplayObject,
  createCenteredSprite,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import {
  AnimationTimeSetting,
  HitResult,
  ModHiddenSetting,
  PositionSetting,
  ScaleSetting,
  TintSetting,
} from "../DrawableSettings";
import { fadeInT, fadeOutT, scaleToT } from "../utils/Transformations";
import { OsuClassicConstants } from "./OsuClassicConstants";
import { PrepareSetting } from "../utils/Preparable";
import { Easing } from "@rewind/osu/math";

// Legacy, in osu!lazer there is a bunch of more stuff such as triangles

export interface OsuClassicHitCircleAreaSettings
  extends AnimationTimeSetting,
    ModHiddenSetting,
    TintSetting,
    ScaleSetting,
    PositionSetting {
  // The number that is displayed inside the circle (comboIndex)
  number: number;
  numberOverlap: number;
  numberScaling: number;

  // The color tint of the hitCircleArea
  tint: number;

  // The textures to provide to the three sprites
  hitCircleTexture: Texture;
  numberTextures: Texture[]; // digit `i` has `numberTextures[i]`
  hitCircleOverlayTexture: Texture;

  // Usually the HitCircleArea is like a sandwich with the hitCircleTexture on the bottom and the overlay on the top with
  // the number in between, except if hitCircleOverlayAboveNumber is false, then the number is on the top.
  hitCircleOverlayAboveNumber: boolean;

  // Animation relevant properties
  // A not mutable property? Maybe as a constructor
  approachDuration: number;
  fadeInDuration: number;

  scale: number;

  hitResult: HitResult | null;
}

// Numbers in HitCircles are downscaled by 0.8, see: https://osu.ppy.sh/wiki/el/Skinning/osu%21
const DEFAULT_NUMBER_SCALING_IN_HIT_CIRCLE = 0.8;
const DEFAULT_NUMBER_TEXTURES: Texture[] = Array(10).fill(Texture.EMPTY);

const defaultSettings: OsuClassicHitCircleAreaSettings = {
  // Very likely to change
  time: 0,
  // Likely to change
  modHidden: false,
  hitResult: null,

  // Unlikely to change (rare events such as SkinChange, BeatmapDiff change)
  // But this actually depends on the application, e.g., position could often change in an osu!editor.
  number: 1,
  numberOverlap: 0,
  numberScaling: DEFAULT_NUMBER_SCALING_IN_HIT_CIRCLE,

  hitCircleOverlayTexture: Texture.EMPTY,
  numberTextures: DEFAULT_NUMBER_TEXTURES,
  hitCircleTexture: Texture.EMPTY,

  tint: 0x111111,
  hitCircleOverlayAboveNumber: true,
  approachDuration: 450, // AR10
  scale: 0.57, // CS4
  position: { x: 0, y: 0 },
  fadeInDuration: OsuClassicConstants.DEFAULT_FADE_IN_DURATION, // 400ms
};

/**
 * Timing is relative to zero.
 * The animation starts at time `-approachDuration`.
 */
export class OsuClassicHitCircleArea implements PrepareSetting<OsuClassicHitCircleAreaSettings> {
  public container: Container;
  private hitCircleSprite: Sprite;
  private readonly number: OsuClassicNumber;
  private hitCircleOverlaySprite: Sprite;

  private settings: OsuClassicHitCircleAreaSettings; // 100% immutable

  // Maybe use IOC for the children (since the sprites could come from a pool or something)
  constructor(settings?: Partial<OsuClassicHitCircleAreaSettings>) {
    this.container = new Container();
    // This is the default order (in case no hitCircleOverlayAboveNumber)
    this.container.addChild((this.hitCircleSprite = createCenteredSprite()));
    this.container.addChild((this.number = new OsuClassicNumber()));
    this.container.addChild((this.hitCircleOverlaySprite = createCenteredSprite()));
    this.settings = Object.freeze({ ...defaultSettings, ...settings });
  }

  private prepareHitCircleSprites(): void {
    const { hitCircleTexture, hitCircleOverlayTexture, tint } = this.settings;
    this.hitCircleSprite.texture = hitCircleTexture;
    this.hitCircleOverlaySprite.texture = hitCircleOverlayTexture;
    this.hitCircleSprite.tint = tint;
  }

  private prepareNumber(): void {
    const { number, numberTextures: textures, numberOverlap: overlap } = this.settings;
    const hideNumber = false; // TODO: Maybe as a setting?
    if (hideNumber) this.number.renderable = false; // ??
    this.number.prepare({ number, textures, overlap });
  }

  private prepareSpriteOrder(): void {
    // Define the order by setting the zIndices
    const { hitCircleOverlayAboveNumber } = this.settings;
    this.hitCircleSprite.zIndex = 0;
    if (hitCircleOverlayAboveNumber) {
      this.number.zIndex = 1;
      this.hitCircleOverlaySprite.zIndex = 2;
    } else {
      this.hitCircleOverlaySprite.zIndex = 1;
      this.number.zIndex = 2;
    }
    this.container.sortChildren(); // Container.sortChildren() will do it by zIndex
  }

  private animateHitCircleSprites(): void {
    const { time, hitResult } = this.settings;
    const props = evaluateTransformationsToProperties(hitCircleSpritesTransform(hitResult), time, {
      alpha: 1.0,
      scale: 1.0,
    });
    [this.hitCircleSprite, this.hitCircleOverlaySprite].forEach((s) => applyPropertiesToDisplayObject(props, s));
  }

  private animateNumber(): void {
    const { time, numberScaling, hitResult } = this.settings;
    const props = evaluateTransformationsToProperties(numberTransform(hitResult), time, {
      alpha: 1.0,
      scale: numberScaling,
    });
    applyPropertiesToDisplayObject(props, this.number);
  }

  private animateSelf(): void {
    const { time, hitResult, modHidden, approachDuration, fadeInDuration, scale, position } = this.settings;
    const transforms = modHidden
      ? hiddenHitCircleTransforms(approachDuration)
      : normalHitCircleTransforms(approachDuration, fadeInDuration, hitResult);
    const thisProps = evaluateTransformationsToProperties(transforms, time, { alpha: 1.0, scale, position });
    applyPropertiesToDisplayObject(thisProps, this.container);
  }

  private animate(): void {
    this.animateHitCircleSprites();
    this.animateNumber();
    this.animateSelf();
  }

  prepare(settings: Partial<OsuClassicHitCircleAreaSettings>): void {
    this.settings = Object.freeze({ ...this.settings, ...settings });
    this.prepareSpriteOrder();
    this.prepareNumber();
    this.prepareHitCircleSprites();
    this.animate();
  }
}

// Numbers fade away a bit faster than the HitCircleSprites
function numberTransform(hitResult: HitResult | null): DisplayObjectTransformationProcess {
  if (!hitResult || !hitResult.hit) {
    return {};
  }
  const { timing } = hitResult;
  return {
    alpha: {
      startValue: 1,
      transformations: [
        {
          time: [timing, timing + OsuClassicConstants.LEGACY_FADE_OUT_DURATION / 4],
          func: fadeOutT(0, Easing.OUT),
        },
      ],
    },
  };
}

// Fully visible at time 0
function normalHitCircleTransforms(
  approachDuration: number,
  fadeInDuration: number,
  hitResult: HitResult | null,
): DisplayObjectTransformationProcess {
  const delay = 800; // this is I think a small hack of lazer to wait for other sprites to transform
  const supposedToHitTime = 0;
  // TODO: also handle the case with hitResult undefined ...
  const hit = hitResult && hitResult.hit;
  return {
    alpha: {
      startValue: 0,
      transformations: [
        { time: [-approachDuration, -approachDuration + fadeInDuration], func: fadeInT() },
        hit
          ? { time: [supposedToHitTime + delay, supposedToHitTime + delay + 1], func: fadeOutT() }
          : { time: [supposedToHitTime, supposedToHitTime + 100], func: fadeOutT() },
      ],
    },
  };
}

function hiddenHitCircleTransforms(approachDuration: number): DisplayObjectTransformationProcess {
  const fadeInDuration = approachDuration * OsuClassicConstants.fadeInDurationMultiplier;
  const fadeOutDuration = approachDuration * OsuClassicConstants.fadeOutDurationMultiplier;
  const fullyFadedInTime = -approachDuration + fadeInDuration;
  return {
    alpha: {
      startValue: 0,
      transformations: [
        { time: [-approachDuration, -approachDuration + fadeInDuration], func: fadeInT() },
        { time: [fullyFadedInTime, fullyFadedInTime + fadeOutDuration], func: fadeOutT() },
      ],
    },
  };
}

// In case of HitResult at "v"
//                      v
// |--preemptDuration------|
// |--fadeIn--|         |--fadeOut--|
// If there is a miss, then .hit might also be relevant?
function hitCircleSpritesTransform(hitResult: HitResult | null): DisplayObjectTransformationProcess {
  if (!hitResult || !hitResult.hit) {
    return {};
  }
  const { timing } = hitResult;
  // Only if there is a hit we will make a small "explosion" animation
  return {
    alpha: {
      startValue: 1,
      transformations: [
        {
          time: [timing, timing + OsuClassicConstants.LEGACY_FADE_OUT_DURATION],
          func: fadeOutT(0, Easing.OUT),
        },
      ],
    },
    scale: {
      startValue: 1,
      transformations: [
        {
          time: [timing, timing + OsuClassicConstants.LEGACY_FADE_OUT_DURATION],
          func: scaleToT(1.4, Easing.OUT),
        },
      ],
    },
  };
}
