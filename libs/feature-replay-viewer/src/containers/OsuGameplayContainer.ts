import { Container } from "@pixi/display";
import {
  HitCircle,
  MainHitObjectVerdict,
  OsuAction,
  OsuHitObject,
  ReplayState,
  Slider,
  SliderCheckPoint,
} from "@rewind/osu/core";
import {
  OsuClassicApproachCircle,
  OsuClassicCursor,
  OsuClassicHitCircleArea,
  OsuClassicSliderBall,
  OsuClassicSliderBody,
  OsuClassicSliderRepeat,
  PlayfieldBorder,
  SliderTextureManager,
} from "@rewind/osu-pixi/classic-components";
import { Skin } from "../skins/Skin";
import { settingsApproachCircle, settingsHitCircleArea } from "./HitCircle";
import { sliderBodySetting } from "./Slider";
import { SkinTextures } from "@rewind/osu/skin";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../utils/Replay";
import { sliderRepeatAngle } from "../utils/Sliders";
import { ReplayViewerContext } from "./ReplayViewerContext";
import { AnalysisCursor } from "../components/AnalysisCursor";
import { OsuClassicJudgement } from "../../../osu-pixi/classic-components/src/hitobjects/OsuClassicJudgements";
import { circleSizeToScale } from "@rewind/osu/math";

/*
            {
                playfieldBorder = new PlayfieldBorder { RelativeSizeAxes = Axes.Both },
                spinnerProxies = new ProxyContainer { RelativeSizeAxes = Axes.Both },
                followPoints = new FollowPointRenderer { RelativeSizeAxes = Axes.Both },
                judgementLayer = new JudgementContainer<DrawableOsuJudgement> { RelativeSizeAxes = Axes.Both },
                HitObjectContainer,
                judgementAboveHitObjectLayer = new Container { RelativeSizeAxes = Axes.Both },
                approachCircles = new ProxyContainer { RelativeSizeAxes = Axes.Both },
                }

 */
export class OsuGameplayContainer {
  container: Container;
  playfieldBorder: PlayfieldBorder;
  judgementLayer: Container;
  hitObjectContainer: Container;
  approachCircles: Container;
  cursorContainer: Container;

  sliderBodyProcessed = new Set<string>();
  sliderBodyPool = new Map<string, OsuClassicSliderBody>();
  private replayState?: ReplayState;

  constructor(
    private readonly sliderTextureManager: SliderTextureManager,
    private readonly context: ReplayViewerContext,
  ) {
    this.container = new Container();
    this.playfieldBorder = new PlayfieldBorder();
    this.hitObjectContainer = new Container();
    this.judgementLayer = new Container();
    this.approachCircles = new Container();
    this.cursorContainer = new Container();
    this.container.addChild(
      this.playfieldBorder,
      this.judgementLayer,
      this.hitObjectContainer,
      this.approachCircles,
      this.cursorContainer,
    );
  }

  private get hitObjects(): OsuHitObject[] {
    return this.context.beatmap.hitObjects;
  }

  private get view() {
    return this.context.view;
  }

  private get modHidden() {
    return this.view.modHidden;
  }

  private get skin() {
    return this.context.skin;
  }

  private get replayTimeMachine() {
    return this.context.replayTimeMachine;
  }

  private get replayFrames() {
    return this.context.replay?.frames ?? [];
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
      isAtEnd = 1 - isAtEnd;

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
      if (c.type === "TICK") ticks.push(c);
      if (c.type === "REPEAT") repeats.push(c);
      if (c.type === "LAST_LEGACY_TICK") legacyTick = c; // can only be one
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
    const { showTrail, scaleWithCS, scale } = this.context.view.osuCursor;

    const pi = findIndexInReplayAtTime(this.replayFrames, time);
    // we are either before the beginning or after the end of the replay
    if (pi === -1 || pi + 1 >= this.replayFrames.length) return;

    // console.log(pi);
    const position = interpolateReplayPosition(this.replayFrames[pi], this.replayFrames[pi + 1], time);
    const trailPositions = [];
    if (showTrail) {
      for (let i = 1; i <= 5 && pi - i >= 0; i++) {
        trailPositions.push(this.replayFrames[pi - i].position);
      }
    }

    cursor.prepare({
      position,
      trailPositions,
      cursorScale: scale,
      cursorTexture: this.skin.getTexture(SkinTextures.CURSOR),
      cursorTrailTexture: this.skin.getTexture(SkinTextures.CURSOR_TRAIL),
    });

    this.cursorContainer.addChild(cursor.container);
  }

  prepareAnalysisCursor(time: number) {
    const cursor = new AnalysisCursor();
    const pi = findIndexInReplayAtTime(this.replayFrames, time);
    // we are either before the beginning or after the end of the replay
    if (pi === -1 || pi + 1 >= this.replayFrames.length) return;
    const position = interpolateReplayPosition(this.replayFrames[pi], this.replayFrames[pi + 1], time);

    const interesting = [];
    const masks: number[] = [];
    // the interesting rule can be changed...

    const points = [];
    const trailCount = 25;
    for (let i = trailCount - 1; i >= 0; i--) {
      masks[i] = 0;
      if (pi - i >= 0) {
        const r = this.replayFrames[pi - i];
        if (r.actions.includes(OsuAction.leftButton)) masks[i] |= 1;
        if (r.actions.includes(OsuAction.rightButton)) masks[i] |= 2;
        if (i + 1 === trailCount) continue;

        // i has a bit that i + 1 does not have (bit=press)
        if ((masks[i] ^ masks[i + 1]) & masks[i]) {
          interesting[i] = true;
        }
      }
    }
    const colorScheme = [
      0x5d6463, // none gray
      0xffa500, // left (orange)
      0x00ff00, // right (green)
      // 0xfa0cd9, // right (pink)
      0x3cbdc1, // both (cyan)
    ];
    for (let i = 0; i < trailCount && pi - i >= 0; i++) {
      const j = pi - i;
      const maskDelta = (masks[i] ^ masks[i + 1]) & masks[i]; //
      points.push({
        interesting: interesting[i],
        color: colorScheme[maskDelta],
        position: this.replayFrames[j].position,
      });
    }
    cursor.prepare({ points, smoothedPosition: position });
    cursor.container.position.set(position.x, position.y);

    this.cursorContainer.addChild(cursor.container);
  }

  prepareCursor(time: number) {
    this.cursorContainer.removeChildren();

    if (this.view.osuCursor.enabled) {
      this.prepareOsuCursor(time);
    }
    if (this.view.analysisCursor.enabled) {
      this.prepareAnalysisCursor(time);
    }
  }

  private static texturesForJudgement(t: MainHitObjectVerdict, lastInComboSet?: boolean) {
    switch (t) {
      case "GREAT":
        return lastInComboSet ? SkinTextures.HIT_300K : SkinTextures.HIT_300;
      case "OK":
        return lastInComboSet ? SkinTextures.HIT_100K : SkinTextures.HIT_100;
      case "MEH":
        return SkinTextures.HIT_50;
      case "MISS":
        return SkinTextures.HIT_0;
    }
  }

  prepareJudgements(time: number) {
    this.judgementLayer.removeChildren();
    if (!this.context.judgements) return;
    // TODO: Order might not be correct
    for (const j of this.context.judgements) {
      const timeAgo = time - j.time;
      if (!(timeAgo >= 0 && timeAgo < 3000) || j.verdict === "GREAT") continue;

      const lastInComboSet = false;
      const textures = this.skin.getTextures(OsuGameplayContainer.texturesForJudgement(j.verdict, lastInComboSet));
      const animationFrameRate = this.skin.config.general.animationFrameRate;
      const judgement = new OsuClassicJudgement();
      const scale = circleSizeToScale(this.context.beatmap.difficulty.circleSize);

      // TODO: Should be configurable, technically speaking sliderHeadJudgementSkip=false does not reflect osu!stable (it resembles lazer)
      // However, in this replay analysis tool this is more useful (?)
      const sliderHeadJudgementSkip = true;
      if (sliderHeadJudgementSkip && j.isSliderHead) continue;
      judgement.prepare({ time: timeAgo, position: j.position, scale, animationFrameRate, textures });
      // judgement.sprite.zIndex = -timeAgo;
      this.judgementLayer.addChild(judgement.sprite);
    }
    // this.judgementLayer.sortChildren();
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

    this.prepareJudgements(time);
  }
}
