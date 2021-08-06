import { Container } from "@pixi/display";
import * as PIXI from "pixi.js";
import { MainHitObjectVerdict, OsuAction } from "@rewind/osu/core";
import { OsuClassicCursor, OsuClassicJudgement, PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import { SkinTextures } from "@rewind/osu/skin";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../utils/Replay";
import { AnalysisCursor } from "../components/AnalysisCursor";
import { circleSizeToScale } from "@rewind/osu/math";
import { Scene } from "../game/Scenario";
import { HitObjectPreparer } from "../pixi/HitObjectPreparer";

const DEBUG = false;

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
  cursorContainer: Container;

  hitObjectPreparer: HitObjectPreparer;

  constructor(renderer: PIXI.Renderer) {
    this.container = new Container();
    this.hitObjectPreparer = new HitObjectPreparer(renderer);

    this.playfieldBorder = new PlayfieldBorder();
    this.judgementLayer = new Container();
    this.cursorContainer = new Container();

    this.container.addChild(
      this.playfieldBorder,
      this.hitObjectPreparer.spinnerProxies,
      this.judgementLayer,
      this.hitObjectPreparer.hitObjectContainer,
      this.hitObjectPreparer.approachCircleContainer,
      this.cursorContainer,
    );
  }

  // prepareOsuCursor(time: number) {
  //   const cursor = new OsuClassicCursor();
  //   const { showTrail, scaleWithCS, scale } = this.context.view.osuCursor;
  //
  //   const pi = findIndexInReplayAtTime(this.replayFrames, time);
  //   // we are either before the beginning or after the end of the replay
  //   if (pi === -1 || pi + 1 >= this.replayFrames.length) return;
  //
  //   // console.log(pi);
  //   const position = interpolateReplayPosition(this.replayFrames[pi], this.replayFrames[pi + 1], time);
  //   const trailPositions = [];
  //   if (showTrail) {
  //     for (let i = 1; i <= 5 && pi - i >= 0; i++) {
  //       trailPositions.push(this.replayFrames[pi - i].position);
  //     }
  //   }
  //
  //   cursor.prepare({
  //     position,
  //     trailPositions,
  //     cursorScale: scale,
  //     cursorTexture: this.skin.getTexture(SkinTextures.CURSOR),
  //     cursorTrailTexture: this.skin.getTexture(SkinTextures.CURSOR_TRAIL),
  //   });
  //
  //   this.cursorContainer.addChild(cursor.container);
  // }
  //
  // prepareAnalysisCursor(time: number) {
  //   const cursor = new AnalysisCursor();
  //   const pi = findIndexInReplayAtTime(this.replayFrames, time);
  //   // we are either before the beginning or after the end of the replay
  //   if (pi === -1 || pi + 1 >= this.replayFrames.length) return;
  //   const position = interpolateReplayPosition(this.replayFrames[pi], this.replayFrames[pi + 1], time);
  //
  //   const interesting = [];
  //   const masks: number[] = [];
  //   // the interesting rule can be changed...
  //
  //   const points = [];
  //   const trailCount = 25;
  //   for (let i = trailCount - 1; i >= 0; i--) {
  //     masks[i] = 0;
  //     if (pi - i >= 0) {
  //       const r = this.replayFrames[pi - i];
  //       if (r.actions.includes(OsuAction.leftButton)) masks[i] |= 1;
  //       if (r.actions.includes(OsuAction.rightButton)) masks[i] |= 2;
  //       if (i + 1 === trailCount) continue;
  //
  //       // i has a bit that i + 1 does not have (bit=press)
  //       if ((masks[i] ^ masks[i + 1]) & masks[i]) {
  //         interesting[i] = true;
  //       }
  //     }
  //   }
  //   const colorScheme = [
  //     0x5d6463, // none gray
  //     0xffa500, // left (orange)
  //     0x00ff00, // right (green)
  //     // 0xfa0cd9, // right (pink)
  //     0x3cbdc1, // both (cyan)
  //   ];
  //   for (let i = 0; i < trailCount && pi - i >= 0; i++) {
  //     const j = pi - i;
  //     const maskDelta = (masks[i] ^ masks[i + 1]) & masks[i]; //
  //     points.push({
  //       interesting: interesting[i],
  //       color: colorScheme[maskDelta],
  //       position: this.replayFrames[j].position,
  //     });
  //   }
  //   cursor.prepare({ points, smoothedPosition: position });
  //   cursor.container.position.set(position.x, position.y);
  //
  //   this.cursorContainer.addChild(cursor.container);
  // }
  //
  // prepareCursor(time: number) {
  //   this.cursorContainer.removeChildren();
  //
  //   if (this.view.osuCursor.enabled) {
  //     this.prepareOsuCursor(time);
  //   }
  //   if (this.view.analysisCursor.enabled) {
  //     this.prepareAnalysisCursor(time);
  //   }
  // }
  //
  // private static texturesForJudgement(t: MainHitObjectVerdict, lastInComboSet?: boolean) {
  //   switch (t) {
  //     case "GREAT":
  //       return lastInComboSet ? SkinTextures.HIT_300K : SkinTextures.HIT_300;
  //     case "OK":
  //       return lastInComboSet ? SkinTextures.HIT_100K : SkinTextures.HIT_100;
  //     case "MEH":
  //       return SkinTextures.HIT_50;
  //     case "MISS":
  //       return SkinTextures.HIT_0;
  //   }
  // }
  //
  // prepareJudgements(time: number) {
  //   this.judgementLayer.removeChildren();
  //   if (!this.context.judgements) return;
  //   // TODO: Order might not be correct
  //   for (const j of this.context.judgements) {
  //     const timeAgo = time - j.time;
  //     if (!(timeAgo >= 0 && timeAgo < 3000) || j.verdict === "GREAT") continue;
  //
  //     const lastInComboSet = false;
  //     const textures = this.skin.getTextures(OsuGameplayContainer.texturesForJudgement(j.verdict, lastInComboSet));
  //     const animationFrameRate = this.skin.config.general.animationFrameRate;
  //     const judgement = new OsuClassicJudgement();
  //     const scale = circleSizeToScale(this.context.beatmap.difficulty.circleSize);
  //
  //     // TODO: Should be configurable, technically speaking sliderHeadJudgementSkip=false does not reflect osu!stable (it resembles lazer)
  //     // However, in this replay analysis tool this is more useful (?)
  //     const sliderHeadJudgementSkip = true;
  //     if (sliderHeadJudgementSkip && j.isSliderHead) continue;
  //     judgement.prepare({ time: timeAgo, position: j.position, scale, animationFrameRate, textures });
  //     // judgement.sprite.zIndex = -timeAgo;
  //     this.judgementLayer.addChild(judgement.sprite);
  //   }
  //   // this.judgementLayer.sortChildren();
  // }

  prepare(scene: Scene) {
    const { skin, beatmap, gameplayInfo, time, replay } = scene;

    this.hitObjectPreparer.prepare(scene);

    // this.prepareCursor(time);
    //
    // this.prepareJudgements(time);
  }
}
