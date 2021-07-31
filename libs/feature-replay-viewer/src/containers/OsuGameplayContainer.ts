import { Container } from "@pixi/display";
import {
  HitCircle,
  OsuHitObject,
  ReplayFrame,
  ReplayState,
  ReplayStateTimeMachine,
  Slider,
  SliderCheckPoint,
  SliderCheckPointType,
} from "@rewind/osu/core";
import {
  OsuClassicApproachCircle,
  OsuClassicCursor,
  OsuClassicHitCircleArea,
  OsuClassicSliderBall,
  OsuClassicSliderBody,
  PlayfieldBorder,
  SliderTextureManager,
} from "@rewind/osu-pixi/classic-components";
import { Skin } from "../skins/Skin";
import { settingsApproachCircle, settingsHitCircleArea } from "./HitCircle";
import { sliderBodySetting } from "./Slider";
import { SkinTextures } from "@rewind/osu/skin";
import { findIndexInReplayAtTime, findPositionInReplayAtTime } from "../utils/Replay";
import { OsuClassicSliderRepeat } from "@rewind/osu-pixi/classic-components";
import { sliderRepeatAngle } from "../utils/Sliders";
import { DEFAULT_VIEW_SETTINGS, ViewSettings } from "../ViewSettings";
import { RenderSettings } from "../stores/RenderSettings";
import { Scenario } from "../stores/Scenario";

export class OsuGameplayContainer {
  container: Container;
  playfieldBorder: PlayfieldBorder;
  hitObjectContainer: Container;
  approachCircles: Container;
  cursorContainer: Container;

  sliderBodyProcessed = new Set<string>();
  sliderBodyPool = new Map<string, OsuClassicSliderBody>();
  private replayState?: ReplayState;

  constructor(
    private readonly sliderTextureManager: SliderTextureManager,
    private readonly renderSettings: RenderSettings,
    private readonly scenario: Scenario,
  ) {
    this.container = new Container();
    this.playfieldBorder = new PlayfieldBorder();
    this.hitObjectContainer = new Container();
    this.approachCircles = new Container();
    this.cursorContainer = new Container();
    this.container.addChild(this.playfieldBorder, this.hitObjectContainer, this.approachCircles, this.cursorContainer);
  }

  private get hitObjects(): OsuHitObject[] {
    return this.scenario.beatmap?.hitObjects ?? [];
  }

  private get modHidden() {
    return this.renderSettings.modHidden;
  }

  private get skin() {
    return this.renderSettings.skin;
  }

  private get replayTimeMachine() {
    return this.scenario.replayStateTimeMachine;
  }

  private get replayFrames() {
    return this.scenario.replay?.frames ?? [];
  }

  // TODO: CACHING
  private getOsuClassicHitCircleArea(id: string) {
    return new OsuClassicHitCircleArea();
  }

  private getOsuClassicApproachCircle(id: string) {
    return new OsuClassicApproachCircle({});
  }

  private prepareHitCircle(gameTime: number, hitCircle: HitCircle) {
    const skin = this.skin;
    const modHidden = this.modHidden;

    if (gameTime < hitCircle.spawnTime || hitCircle.hitTime + 300 < gameTime) return;
    {
      const p = this.getOsuClassicHitCircleArea(hitCircle.id);
      const hitResult = { hit: true, timing: 0 }; // Will be asked from some other component
      p.prepare(settingsHitCircleArea({ hitCircle, gameTime, modHidden, skin, hitResult }));
      this.hitObjectContainer.addChild(p.container);
    }
    {
      const p = this.getOsuClassicApproachCircle(hitCircle.id);
      p.prepare(settingsApproachCircle({ hitCircle, skin, gameTime, modHidden }));
      this.approachCircles.addChild(p.sprite);
    }
  }

  private getSliderBody(id: string): OsuClassicSliderBody {
    if (!this.sliderBodyPool.has(id)) {
      this.sliderBodyPool.set(id, new OsuClassicSliderBody(this.sliderTextureManager));
    }
    this.sliderBodyProcessed.add(id);
    return this.sliderBodyPool.get(id) as OsuClassicSliderBody;
  }

  private prepareSliderBody(gameTime: number, slider: Slider) {
    const body = this.getSliderBody(slider.id);
    const skin = this.skin;
    const modHidden = this.modHidden;
    const setting = sliderBodySetting({ skin, modHidden, slider, gameTime });
    body.prepare(setting);
    this.hitObjectContainer.addChild(body.container);
  }

  private prepareSliderTail(gameTime: number, slider: Slider) {
    /* TODO */
  }

  private prepareSliderTicks(gameTime: number, ticks: SliderCheckPoint[]) {}

  private prepareSliderRepeats(gameTime: number, repeats: SliderCheckPoint[], slider: Slider) {
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

      if (gameTime < r.hitTime - approachDuration || r.hitTime + approachDuration < gameTime) return;
      const repeat = new OsuClassicSliderRepeat();
      const beatLength = 350;
      // See DrawableSliderRepeat -> `animDuration`
      const fadeInOutDuration = Math.min(300, slider.spanDuration);
      const time = gameTime - hitTime;
      const texture = this.skin.getTexture(SkinTextures.SLIDER_REPEAT);
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

      // Toggle
      isAtEnd = 1 - isAtEnd;
    });
  }

  private prepareSliderBall(gameTime: number, slider: Slider) {
    if (gameTime < slider.startTime || slider.endTime < gameTime) return;
    const progress = (gameTime - slider.startTime) / slider.duration;
    const position = slider.ballPositionAt(progress);

    const sliderBall = new OsuClassicSliderBall();
    sliderBall.prepare({
      ballTint: null, // TODO
      ballTexture: this.skin.getTexture(SkinTextures.SLIDER_BALL),
      followCircleTexture: this.skin.getTexture(SkinTextures.SLIDER_FOLLOW_CIRCLE),
      position,
      scale: slider.scale,
    });

    this.hitObjectContainer.addChild(sliderBall.container);
  }

  // This is for experts who want to know where it is
  private prepareSliderLastTick(gameTime: number, lastLegacyTick: SliderCheckPoint) {}

  private prepareSlider(time: number, slider: Slider) {
    if (time < slider.spawnTime || time > slider.endTime + 300) return;
    // Order: Body, Tail, Tick, Repeat, Ball, Head (?)
    this.prepareSliderBody(time, slider);

    const ticks: SliderCheckPoint[] = [];
    const repeats: SliderCheckPoint[] = [];
    let legacyTick;
    slider.checkPoints.forEach((c) => {
      if (c.type === SliderCheckPointType.TICK) ticks.push(c);
      if (c.type === SliderCheckPointType.REPEAT) repeats.push(c);
      if (c.type === SliderCheckPointType.LAST_LEGACY_TICK) legacyTick = c; // can only be one
    });

    this.prepareSliderTail(time, slider);
    this.prepareSliderTicks(time, ticks);
    if (legacyTick) this.prepareSliderLastTick(time, legacyTick); // not sure about order of this one
    this.prepareSliderRepeats(time, repeats, slider);
    this.prepareSliderBall(time, slider);

    this.prepareHitCircle(time, slider.head);
  }

  private processSliders() {
    this.sliderTextureManager.processJobs();

    const removeIds = [];
    for (const id of this.sliderBodyPool.keys()) {
      if (!this.sliderBodyProcessed.has(id)) {
        removeIds.push(id);
      }
    }
    removeIds.forEach((id) => {
      const slider = this.sliderBodyPool.get(id) as OsuClassicSliderBody;
      // TODO: Dispose
      // slider.dispose();
      this.sliderBodyPool.delete(id);
    });
    this.sliderBodyProcessed.clear();
  }

  prepareOsuCursor(time: number) {
    const cursor = new OsuClassicCursor();
    const hideCursorTrail = false;

    const position = findPositionInReplayAtTime(this.replayFrames, time);
    if (position === null)
      // we are either before the beginning or after the end of the replay
      return;

    // Could be optimized with a single call with the one above
    const pi = findIndexInReplayAtTime(this.replayFrames, time);
    const trailPositions = [];
    if (!hideCursorTrail) {
      for (let i = 1; i <= 5 && pi - i >= 0; i++) {
        trailPositions.push(this.replayFrames[pi - i].position);
      }
    }
    const cursorScale = 1.0; // get from settings

    cursor.prepare({
      position,
      trailPositions,
      cursorScale,
      cursorTexture: this.skin.getTexture(SkinTextures.CURSOR),
      cursorTrailTexture: this.skin.getTexture(SkinTextures.CURSOR_TRAIL),
    });

    this.cursorContainer.addChild(cursor.container);
  }

  prepareCursor(time: number) {
    this.cursorContainer.removeChildren();

    if (this.renderSettings.osuCursor.enabled) {
      this.prepareOsuCursor(time);
    }
  }

  prepare(time: number) {
    if (this.skin === Skin.EMPTY) return;
    // console.log("prepare time", time, this.hitObjects.length);

    if (this.replayTimeMachine !== undefined) {
      this.replayState = this.replayTimeMachine.replayStateAt(time);
    } else {
      this.replayState = undefined;
    }

    this.approachCircles.removeChildren();
    this.hitObjectContainer.removeChildren();

    // TODO: This assumes that they are ordered by some time
    for (let i = this.hitObjects.length - 1; i >= 0; i--) {
      const ho = this.hitObjects[i];
      if (ho instanceof HitCircle) this.prepareHitCircle(time, ho);
      if (ho instanceof Slider) this.prepareSlider(time, ho);
    }
    this.processSliders();

    this.prepareCursor(time);
  }
}
