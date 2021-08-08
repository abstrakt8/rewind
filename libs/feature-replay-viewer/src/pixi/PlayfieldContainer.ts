import { Container } from "@pixi/display";
import * as PIXI from "pixi.js";
import { MainHitObjectVerdict, OsuAction } from "@rewind/osu/core";
import { OsuClassicCursor, OsuClassicJudgement, PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import { SkinTextures } from "@rewind/osu/skin";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../utils/Replay";
import { AnalysisCursor } from "./components/AnalysisCursor";
import { circleSizeToScale } from "@rewind/osu/math";
import { Scene } from "../game/Scene";
import { HitObjectPreparer } from "./HitObjectPreparer";

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
export class PlayfieldContainer {
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
      this.playfieldBorder.graphics,
      this.hitObjectPreparer.spinnerProxies,
      this.judgementLayer,
      this.hitObjectPreparer.hitObjectContainer,
      this.hitObjectPreparer.approachCircleContainer,
      this.cursorContainer,
    );
  }

  prepareOsuCursor(scene: Scene) {
    const { time, replay, skin } = scene;
    const cursor = new OsuClassicCursor();
    const { showTrail, scaleWithCS, scale } = scene.view.osuCursor;
    if (!replay) return;
    const frames = replay.frames;

    const pi = findIndexInReplayAtTime(frames, time);
    // we are either before the beginning or after the end of the replay
    if (pi === -1 || pi + 1 >= frames.length) return;

    // console.log(pi);
    const position = interpolateReplayPosition(frames[pi], frames[pi + 1], time);
    const trailPositions = [];
    if (showTrail) {
      for (let i = 1; i <= 5 && pi - i >= 0; i++) {
        trailPositions.push(frames[pi - i].position);
      }
    }

    cursor.prepare({
      position,
      trailPositions,
      cursorScale: scale,
      cursorTexture: skin.getTexture(SkinTextures.CURSOR),
      cursorTrailTexture: skin.getTexture(SkinTextures.CURSOR_TRAIL),
    });

    this.cursorContainer.addChild(cursor.container);
  }

  prepareAnalysisCursor(scene: Scene) {
    const { replay, time } = scene;
    if (!replay) return;
    const { frames } = replay;
    const cursor = new AnalysisCursor();
    const pi = findIndexInReplayAtTime(frames, time);
    // we are either before the beginning or after the end of the replay
    if (pi === -1 || pi + 1 >= frames.length) return;
    const position = interpolateReplayPosition(frames[pi], frames[pi + 1], time);

    const interesting = [];
    const masks: number[] = [];
    // the interesting rule can be changed...

    const points = [];
    const trailCount = 25;
    for (let i = trailCount - 1; i >= 0; i--) {
      masks[i] = 0;
      if (pi - i >= 0) {
        const r = frames[pi - i];
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
        position: frames[j].position,
      });
    }
    cursor.prepare({ points, smoothedPosition: position });
    cursor.container.position.set(position.x, position.y);

    this.cursorContainer.addChild(cursor.container);
  }

  prepareCursors(scene: Scene) {
    this.cursorContainer.removeChildren();

    if (scene.view.osuCursor.enabled) {
      this.prepareOsuCursor(scene);
    }
    if (scene.view.analysisCursor.enabled) {
      this.prepareAnalysisCursor(scene);
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

  prepareJudgements(scene: Scene) {
    this.judgementLayer.removeChildren();
    const { judgements, time, skin, beatmap } = scene;
    // TODO: Order might not be correct
    for (const j of judgements) {
      const timeAgo = time - j.time;
      if (!(timeAgo >= 0 && timeAgo < 3000) || j.verdict === "GREAT") continue;

      const lastInComboSet = false;
      const textures = skin.getTextures(PlayfieldContainer.texturesForJudgement(j.verdict, lastInComboSet));
      const animationFrameRate = skin.config.general.animationFrameRate;
      const judgement = new OsuClassicJudgement();
      const scale = circleSizeToScale(beatmap.difficulty.circleSize);

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

  preparePlayfieldBorder(scene: Scene) {
    const { thickness, enabled } = scene.view.playfieldBorder;
    this.playfieldBorder.prepare({ thickness, enabled });
  }

  prepare(scene: Scene) {
    this.preparePlayfieldBorder(scene);
    this.hitObjectPreparer.prepare(scene);
    this.prepareCursors(scene);
    this.prepareJudgements(scene);
  }
}
