import { Container, Sprite, Texture } from "pixi.js";
import { clamp } from "@osujs/math";
import {
  applyPropertiesToDisplayObject,
  DisplayObjectTransformationProcess,
  evaluateTransformationsToProperties,
} from "../utils/Pixi";
import { scaleToT } from "../utils/Transformations";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "../utils/constants";

// New style

// Time = 0 is when it's done and a "CLEAR" is shown.
interface OsuClassicSpinnerSettings {
  approachCircleTexture: Texture;
  modHidden: boolean;
  duration: number;
  time: number;
}

function approachCircleTransformation(settings: {
  modHidden: boolean;
  duration: number;
}): DisplayObjectTransformationProcess {
  const { modHidden, duration } = settings;
  const hitTime = 0;
  const spawnTime = hitTime - duration;

  if (modHidden) {
    return {
      alpha: {
        startValue: 0,
      },
    };
  }
  return {
    scale: {
      startValue: 1.0,
      transformations: [{ time: [spawnTime, hitTime], func: scaleToT(0) }],
    },
  };
}

export class OsuClassicSpinner {
  container: Container;
  approachCircleSprite: Sprite;

  constructor() {
    this.container = new Container();
    this.container.addChild((this.approachCircleSprite = new Sprite()));
    this.approachCircleSprite.anchor.set(0.5, 0.5);
    this.approachCircleSprite.position.set(OSU_PLAYFIELD_WIDTH / 2, OSU_PLAYFIELD_HEIGHT / 2);
  }

  prepare(settings: OsuClassicSpinnerSettings) {
    const { approachCircleTexture, modHidden, duration, time } = settings;

    const finishedPercent = clamp((duration + time) / duration, 0, 1);

    // ApproachCircle
    this.approachCircleSprite.texture = approachCircleTexture;
    applyPropertiesToDisplayObject(
      evaluateTransformationsToProperties(
        approachCircleTransformation({
          modHidden,
          duration,
        }),
        time,
      ),
      this.approachCircleSprite,
    );
  }
}
