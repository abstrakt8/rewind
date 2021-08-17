import { Skin } from "../../Skin";
import { Slider, SliderCheckPoint } from "@rewind/osu/core";
import { Container, DisplayObject, Graphics, Sprite, Texture } from "pixi.js";
import {
  OsuClassicSliderBall,
  OsuClassicSliderBody,
  OsuClassicSliderRepeat,
  OsuClassicSliderTick,
  SliderBodySettings,
} from "@rewind/osu-pixi/classic-components";
import { RGB, Vec2 } from "@rewind/osu/math";
import { SkinTextures } from "@rewind/osu/skin";
import { sliderRepeatAngle } from "../../../../../utils/Sliders";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageViewService } from "../../StageViewService";
import { StageSkinService } from "../../../StageSkinService";
import { injectable } from "inversify";
import { TemporaryObjectPool } from "../../../../../pixi/pooling/TemporaryObjectPool";
import { SliderTextureService } from "../../SliderTextureService";

const DEBUG_FOLLOW_CIRCLE_COLOR = 0xff0000;
const DEBUG_PIXEL_BALL_COLOR = 0x00ff00;

const SLIDER_FADE_OUT_TIME = 300;

@injectable()
export class SliderPreparer {
  graphicsPool: TemporaryObjectPool<Graphics>;

  constructor(
    private readonly gameClock: GameplayClock,
    private readonly stageViewService: StageViewService,
    private readonly stageSkinService: StageSkinService,
    private readonly sliderTextureService: SliderTextureService,
  ) {
    // TODO: Inject
    this.graphicsPool = new TemporaryObjectPool<Graphics>(
      () => new Graphics(),
      (g) => g.clear(),
      { initialSize: 10 },
    );
  }

  private getSliderBody(id: string) {
    return new OsuClassicSliderBody();
  }

  private prepareSliderBody(slider: Slider) {
    const { skin, time: gameTime, view } = this;
    const { modHidden } = view;
    const texture = this.sliderTextureService.getTexture({
      id: slider.id,
      points: slider.path.calculatedPath,
      resolution: 2.25, // TODO: Dynamic
      radius: slider.radius,
      borderColor: skin.config.colors.sliderBorder as RGB,
    });
    const setting = sliderBodySetting({ gameTime, skin, modHidden, slider, texture });
    const body = this.getSliderBody(slider.id);
    body.prepare(setting);
    return body.container;
  }

  private prepareSliderTail(slider: Slider) {
    return new Container();
  }

  // Only for DEBUG option
  private prepareSliderLastLegacyTick(checkpoint: SliderCheckPoint) {
    const delta = checkpoint.hitTime - this.time;
    if (!(delta >= 0 && delta < 500)) return undefined;
    const [lastTick] = this.graphicsPool.allocate(checkpoint.id + "/raw");
    lastTick.clear();
    lastTick.beginFill(0xff0000);
    lastTick.drawCircle(checkpoint.position.x, checkpoint.position.y, 2);
    lastTick.endFill();
    return lastTick;
  }

  private prepareSliderTicks(ticks: SliderCheckPoint[]) {
    const { time: gameTime, skin } = this;
    const sprites: Sprite[] = [];
    ticks.forEach((t) => {
      // See SliderTick.cs
      const { spanIndex, spanStartTime, position, scale } = t;
      const offset = spanIndex > 0 ? 200 : 400 * 0.66;
      const approachDuration = (t.hitTime - spanStartTime) / 2 + offset;
      const graphic = new OsuClassicSliderTick();
      const time = gameTime - t.hitTime;
      const hit = true; // TODO
      const texture = skin.getTexture(SkinTextures.SLIDER_TICK);
      graphic.prepare({ time, position, scale, hit, approachDuration, texture });
      sprites.push(graphic.sprite);
    });
    return sprites;
  }

  private prepareSliderRepeats(repeats: SliderCheckPoint[], slider: Slider) {
    const { time: gameTime, skin } = this;
    const first_end_circle_preempt_adjust = 2 / 3;
    // This is a bit different if there is snaking
    const rotationAngels = [false, true].map((b) => sliderRepeatAngle(slider.path.calculatedPath, b));
    let isAtEnd = 1;
    const sprites: Sprite[] = [];
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
      sprites.push(repeat.sprite);
    });
    return sprites;
  }

  // private prepareSliderBall(gameTime: number, skin: Skin, slider: Slider, sliderAnalysis: boolean) {
  //   if (gameTime < slider.startTime || slider.endTime < gameTime) return;
  //   const progress = (gameTime - slider.startTime) / slider.duration;
  //   const position = slider.ballPositionAt(progress);
  //
  //   const sliderBall = new OsuClassicSliderBall();
  //   sliderBall.prepare({
  //     ballTint: null, // TODO
  //     ballTexture: skin.getTexture(SkinTextures.SLIDER_BALL),
  //     followCircleTexture: skin.getTexture(SkinTextures.SLIDER_FOLLOW_CIRCLE),
  //     position,
  //     scale: slider.scale,
  //   });
  //
  //   this.hitObjectContainer.addChild(sliderBall.container);
  //
  //   if (sliderAnalysis) {
  //     {
  //       const [rawFollowCircle] = this.graphicsPool.allocate(slider.id + "/rawFollowCircle");
  //       rawFollowCircle.clear();
  //       rawFollowCircle.lineStyle(1, DEBUG_FOLLOW_CIRCLE_COLOR);
  //       rawFollowCircle.drawCircle(position.x, position.y, slider.radius * 2.4);
  //       this.hitObjectContainer.addChild(rawFollowCircle);
  //     }
  //     {
  //       const [pixelBall] = this.graphicsPool.allocate(slider.id + "/pixelBall");
  //       pixelBall.clear();
  //       pixelBall.beginFill(DEBUG_PIXEL_BALL_COLOR);
  //       pixelBall.drawCircle(position.x, position.y, 1);
  //       pixelBall.endFill();
  //       this.hitObjectContainer.addChild(pixelBall);
  //     }
  //   }
  // }

  get time() {
    return this.gameClock.timeElapsedInMs;
  }

  get skin() {
    return this.stageSkinService.getSkin();
  }

  get view() {
    return this.stageViewService.getView();
  }

  prepare(slider: Slider) {
    const { time, skin, view } = this;

    const isVisible = slider.spawnTime <= time && time <= slider.endTime + SLIDER_FADE_OUT_TIME;
    if (!isVisible) {
      // VERY IMPORTANT, otherwise there will too many textures in the cache.
      this.sliderTextureService.removeFromCache(slider.id);
      return undefined;
    }

    const container = new Container();

    const addChildren = (displayObjects: DisplayObject[]) =>
      displayObjects.length > 0 ? container.addChild(...displayObjects) : undefined;

    // Order: Body, Tail, Tick, Repeat, Ball, Head (?)
    container.addChild(this.prepareSliderBody(slider));

    const ticks: SliderCheckPoint[] = [];
    const repeats: SliderCheckPoint[] = [];
    let legacyTick;
    slider.checkPoints.forEach((c) => {
      if (c.type === "TICK") ticks.push(c);
      if (c.type === "REPEAT") repeats.push(c);
      if (c.type === "LAST_LEGACY_TICK") legacyTick = c; // can only be one
    });

    container.addChild(this.prepareSliderTail(slider));
    addChildren(this.prepareSliderTicks(ticks));

    if (legacyTick && view.sliderAnalysis) {
      const tick = this.prepareSliderLastLegacyTick(legacyTick);
      if (tick) container.addChild(tick);
    }
    addChildren(this.prepareSliderRepeats(repeats, slider));
    // this.prepareSliderBall(time, skin, slider, view.sliderAnalysis);
    return container;
  }
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
