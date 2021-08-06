import { Container, Graphics, Renderer, Texture } from "pixi.js";
import { Scene } from "../game/Scene";
import { HitCircle, Slider, SliderCheckPoint, Spinner } from "@rewind/osu/core";
import { Skin } from "../skins/Skin";
import {
  BasicSliderTextureRenderer,
  HitResult,
  OsuClassicApproachCircle,
  OsuClassicApproachCircleSettings,
  OsuClassicHitCircleArea,
  OsuClassicHitCircleAreaSettings,
  OsuClassicSliderBall,
  OsuClassicSliderBody,
  OsuClassicSliderRepeat,
  SliderBodySettings,
  SliderTextureManager,
} from "@rewind/osu-pixi/classic-components";
import { SkinTextures } from "@rewind/osu/skin";
import { sliderRepeatAngle } from "../utils/Sliders";
import { RGB, Vec2 } from "@rewind/osu/math";

const DEBUG_FOLLOW_CIRCLE_COLOR = 0xff0000;
const DEBUG_PIXEL_BALL_COLOR = 0x00ff00;

export class HitObjectPreparer {
  sliderTextureManager: SliderTextureManager;

  approachCircleContainer: Container;
  spinnerProxies: Container;
  hitObjectContainer: Container;

  constructor(renderer: Renderer) {
    this.spinnerProxies = new Container();
    this.approachCircleContainer = new Container();
    this.hitObjectContainer = new Container();
    this.sliderTextureManager = new SliderTextureManager(new BasicSliderTextureRenderer(renderer));
  }

  // TODO: Pooling
  private getOsuClassicHitCircleArea(id: string) {
    return new OsuClassicHitCircleArea();
  }

  private getOsuClassicApproachCircle(id: string) {
    return new OsuClassicApproachCircle({});
  }

  private getSliderBody(id: string) {
    return new OsuClassicSliderBody();
  }

  private prepareHitCircle(scene: Scene, hitCircle: HitCircle) {
    const { view, skin, time: gameTime } = scene;
    const { modHidden } = view;

    // TODO: +300?
    if (gameTime < hitCircle.spawnTime || hitCircle.hitTime + 300 < gameTime) return;
    {
      const area = this.getOsuClassicHitCircleArea(hitCircle.id);
      const hitResult = { hit: true, timing: 0 }; // Can be determined from gameplayState
      area.prepare(settingsHitCircleArea({ hitCircle, gameTime, modHidden, skin, hitResult }));
      this.hitObjectContainer.addChild(area.container);
    }
    {
      const approachCircle = this.getOsuClassicApproachCircle(hitCircle.id);
      approachCircle.prepare(settingsApproachCircle({ hitCircle, skin, gameTime, modHidden }));
      this.approachCircleContainer.addChild(approachCircle.sprite);
    }
  }

  private prepareSliderBody(scene: Scene, slider: Slider) {
    const { skin, time: gameTime, view } = scene;
    const { modHidden } = view;
    const texture = this.sliderTextureManager.getTexture({
      id: slider.id,
      points: slider.path.calculatedPath,
      resolution: 2.25, // TODO: Dynamic
      radius: slider.radius,
      borderColor: skin.config.colors.sliderBorder as RGB,
    });
    const setting = sliderBodySetting({ gameTime, skin, modHidden, slider, texture });
    const body = this.getSliderBody(slider.id);
    body.prepare(setting);
    this.hitObjectContainer.addChild(body.container);
  }

  private prepareSliderTail(gameTime: number, slider: Slider) {}

  // Only for DEBUG option
  private prepareSliderLastLegacyTick(gameTime: number, checkpoint: SliderCheckPoint) {
    const delta = checkpoint.hitTime - gameTime;
    if (!(delta >= 0 && delta < 200)) return;
    const g = new Graphics();
    g.beginFill(0xff0000);
    g.drawCircle(checkpoint.position.x, checkpoint.position.y, 2);
    g.endFill();
    this.hitObjectContainer.addChild(g);
  }

  private prepareSliderTicks(gameTime: number, ticks: SliderCheckPoint[]) {}

  private prepareSliderRepeats(gameTime: number, skin: Skin, repeats: SliderCheckPoint[], slider: Slider) {
    const first_end_circle_preempt_adjust = 2 / 3;
    // This is a bit different if there is snaking
    const rotationAngels = [false, true].map((b) => sliderRepeatAngle(slider.path.calculatedPath, b));
    let isAtEnd = 1;
    repeats.forEach((r) => {
      const { position, scale, hitTime } = r;
      const approachDuration =
        r.spanIndex > 0
          ? slider.spanDuration * 2
          : hitTime - slider.startTime + slider.head.approachDuration * first_end_circle_preempt_adjust;

      const rotationAngle = rotationAngels[isAtEnd];
      isAtEnd = 1 - isAtEnd;

      if (gameTime < r.hitTime - approachDuration || r.hitTime + approachDuration < gameTime) return;
      const repeat = new OsuClassicSliderRepeat();
      const beatLength = 350;
      // See DrawableSliderRepeat -> `animDuration`
      const fadeInOutDuration = Math.min(300, slider.spanDuration);
      const time = gameTime - hitTime;
      const texture = skin.getTexture(SkinTextures.SLIDER_REPEAT);
      repeat.prepare({
        position,
        scale,
        time,
        beatLength,
        approachDuration,
        texture,
        fadeInOutDuration,
        hit: true,
        rotationAngle,
      });
      this.hitObjectContainer.addChild(repeat.sprite);
    });
  }

  private prepareSliderBall(gameTime: number, skin: Skin, slider: Slider, sliderAnalysis: boolean) {
    if (gameTime < slider.startTime || slider.endTime < gameTime) return;
    const progress = (gameTime - slider.startTime) / slider.duration;
    const position = slider.ballPositionAt(progress);

    const sliderBall = new OsuClassicSliderBall();
    sliderBall.prepare({
      ballTint: null, // TODO
      ballTexture: skin.getTexture(SkinTextures.SLIDER_BALL),
      followCircleTexture: skin.getTexture(SkinTextures.SLIDER_FOLLOW_CIRCLE),
      position,
      scale: slider.scale,
    });

    this.hitObjectContainer.addChild(sliderBall.container);

    if (sliderAnalysis) {
      {
        const rawFollowCircle = new Graphics();
        rawFollowCircle.lineStyle(1, DEBUG_FOLLOW_CIRCLE_COLOR);
        rawFollowCircle.drawCircle(position.x, position.y, slider.radius * 2.4);
        this.hitObjectContainer.addChild(rawFollowCircle);
      }
      {
        const pixelBall = new Graphics();
        pixelBall.beginFill(DEBUG_PIXEL_BALL_COLOR);
        pixelBall.drawCircle(position.x, position.y, 1);
        pixelBall.endFill();
        this.hitObjectContainer.addChild(pixelBall);
      }
    }
  }

  private prepareSlider(scene: Scene, slider: Slider) {
    const { time, skin, view } = scene;
    if (time < slider.spawnTime || time > slider.endTime + 300) {
      // VERY IMPORTANT, otherwise there will too many textures in the cache.
      this.sliderTextureManager.removeFromCache(slider.id);
      return;
    }
    // Order: Body, Tail, Tick, Repeat, Ball, Head (?)
    this.prepareSliderBody(scene, slider);

    const ticks: SliderCheckPoint[] = [];
    const repeats: SliderCheckPoint[] = [];
    let legacyTick;
    slider.checkPoints.forEach((c) => {
      if (c.type === "TICK") ticks.push(c);
      if (c.type === "REPEAT") repeats.push(c);
      if (c.type === "LAST_LEGACY_TICK") legacyTick = c; // can only be one
    });

    this.prepareSliderTail(time, slider);
    this.prepareSliderTicks(time, ticks);
    if (legacyTick && view.sliderAnalysis) this.prepareSliderLastLegacyTick(time, legacyTick);
    this.prepareSliderRepeats(time, skin, repeats, slider);
    this.prepareSliderBall(time, skin, slider, view.sliderAnalysis);

    this.prepareHitCircle(scene, slider.head);
  }

  prepareSpinner() {}

  prepare(scene: Scene) {
    const { beatmap } = scene;
    const { hitObjects } = beatmap;

    this.hitObjectContainer.removeChildren();
    this.spinnerProxies.removeChildren();
    this.approachCircleContainer.removeChildren();

    // TODO: This assumes that they are ordered by some time
    for (let i = hitObjects.length - 1; i >= 0; i--) {
      const hitObject = hitObjects[i];
      if (hitObject instanceof HitCircle) this.prepareHitCircle(scene, hitObject);
      if (hitObject instanceof Slider) this.prepareSlider(scene, hitObject);
      // if (hitObject instanceof Spinner) this.prepareSpinner();
    }
  }
}

// Helper functions to set the settings

export function settingsApproachCircle(s: {
  hitCircle: HitCircle;
  skin: Skin;
  gameTime: number;
  modHidden?: boolean;
}): Partial<OsuClassicApproachCircleSettings> {
  const { hitCircle, skin, gameTime, modHidden } = s;
  return {
    time: gameTime - hitCircle.hitTime,
    texture: skin.getTexture(SkinTextures.APPROACH_CIRCLE),
    approachDuration: hitCircle.approachDuration,
    scale: hitCircle.scale,
    position: hitCircle.position,
    tint: skin.getComboColorForIndex(hitCircle.comboSetIndex),
    modHidden: modHidden,
    // fadeInDuration, numberScaling
  };
}

function settingsHitCircleArea(s: {
  hitCircle: HitCircle;
  skin: Skin;
  gameTime: number;
  modHidden?: boolean;
  hitResult: HitResult | null;
}): Partial<OsuClassicHitCircleAreaSettings> {
  const { gameTime, hitCircle, skin, modHidden, hitResult } = s;
  return {
    time: gameTime - hitCircle.hitTime,
    numberTextures: skin.getHitCircleNumberTextures(),
    numberOverlap: skin.config.fonts.hitCircleOverlap,
    hitCircleOverlayAboveNumber: skin.config.general.hitCircleOverlayAboveNumber,

    hitCircleTexture: skin.getTexture(SkinTextures.HIT_CIRCLE),
    hitCircleOverlayTexture: skin.getTexture(SkinTextures.HIT_CIRCLE_OVERLAY),

    tint: skin.getComboColorForIndex(hitCircle.comboSetIndex),

    number: hitCircle.withinComboSetIndex + 1,
    approachDuration: hitCircle.approachDuration,

    modHidden,
    scale: hitCircle.scale,
    position: hitCircle.position,
    hitResult,
    // fadeInDuration, numberScaling
  };
}

export function sliderBodySetting(s: {
  skin: Skin;
  modHidden: boolean;
  slider: Slider;
  gameTime: number;
  texture: Texture;
}): SliderBodySettings {
  const { texture, modHidden, slider, gameTime } = s;
  const headPositionInRectangle = Vec2.scale(slider.path.boundaryBox[0], -1).add({
    x: slider.radius,
    y: slider.radius,
  });

  return {
    modHidden,
    duration: slider.duration,
    position: slider.head.position,
    approachDuration: slider.head.approachDuration,
    time: gameTime - slider.startTime,
    texture,
    headPositionInRectangle,
  };
}
