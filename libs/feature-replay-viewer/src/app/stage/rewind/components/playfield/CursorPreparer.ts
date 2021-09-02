import { Container } from "pixi.js";
import { OsuClassicCursor } from "@rewind/osu-pixi/classic-components";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../../../../../utils/Replay";
import { SkinTextures } from "@rewind/osu/skin";
import { AnalysisCursor } from "../../../../pixi/components/AnalysisCursor";
import { OsuAction } from "@rewind/osu/core";
import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../../../STAGE_TYPES";
import { StageSkinService } from "../../../StageSkinService";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageViewService } from "../../StageViewService";
import type { OsuReplay } from "../../../../theater/osuReplay";

@injectable()
export class CursorPreparer {
  private readonly container: Container;
  private readonly osuClassicCursor: OsuClassicCursor;
  private readonly analysisCursor: AnalysisCursor;

  constructor(
    @inject(STAGE_TYPES.REPLAY) private readonly replay: OsuReplay,
    private readonly stageSkinService: StageSkinService,
    private readonly gameClock: GameplayClock,
    private readonly stageViewService: StageViewService,
  ) {
    this.container = new Container();
    this.osuClassicCursor = new OsuClassicCursor();
    this.analysisCursor = new AnalysisCursor();
  }

  get time() {
    return this.gameClock.timeElapsedInMs;
  }

  get skin() {
    return this.stageSkinService.getSkin();
  }

  get view() {
    return this.stageViewService.getView();
  }

  prepareOsuCursor() {
    const { osuCursor } = this.view;

    if (!osuCursor.enabled) {
      return;
    }

    const { time, replay, skin } = this;
    const cursor = this.osuClassicCursor;
    const { showTrail, scaleWithCS, scale } = osuCursor;
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

    this.container.addChild(cursor.container);
  }

  prepareAnalysisCursor() {
    const { replay, time, view } = this;
    const { enabled } = view.analysisCursor;
    if (!enabled) {
      return;
    }

    if (!replay) return;
    const { frames } = replay;
    const cursor = this.analysisCursor;
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

    this.container.addChild(cursor.container);
  }

  prepare() {
    this.container.removeChildren();
    this.prepareOsuCursor();
    this.prepareAnalysisCursor();
  }

  getContainer() {
    return this.container;
  }
}
