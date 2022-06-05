import { Container } from "pixi.js";
import { OsuClassicCursor } from "@rewind/osu-pixi/classic-components";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../../../../utils/replay";
import { AnalysisCursor, AnalysisPoint } from "@rewind/osu-pixi/rewind";
import { OsuAction } from "@osujs/core";
import { injectable } from "inversify";
import { GameplayClock } from "../../../common/game/GameplayClock";
import { ReplayManager } from "../../../manager/ReplayManager";
import { AnalysisCursorSettingsStore } from "../../../analysis/analysis-cursor";
import { ReplayCursorSettingsStore } from "../../../common/replay-cursor";
import { Position } from "@osujs/math";
import { SkinHolder } from "../../../common/skin";

@injectable()
export class CursorPreparer {
  private readonly container: Container;
  private readonly osuClassicCursor: OsuClassicCursor;
  private readonly analysisCursor: AnalysisCursor;

  constructor(
    private readonly replayManager: ReplayManager,
    private readonly skinManager: SkinHolder,
    private readonly gameClock: GameplayClock,
    private readonly analysisCursorSettingsStore: AnalysisCursorSettingsStore,
    private readonly replayCursorSettingsStore: ReplayCursorSettingsStore,
  ) {
    this.container = new Container();
    this.osuClassicCursor = new OsuClassicCursor();
    this.analysisCursor = new AnalysisCursor();
  }

  get time() {
    return this.gameClock.timeElapsedInMs;
  }

  get analysisCursorSettings() {
    return this.analysisCursorSettingsStore.settings;
  }

  updateOsuCursor() {
    const { enabled, scaleWithCS, scale, showTrail, smoothCursorTrail } = this.replayCursorSettingsStore.settings;

    if (!enabled) {
      return;
    }

    const skin = this.skinManager.getSkin();
    const replay = this.replayManager.getMainReplay();
    const { time } = this;
    const cursor = this.osuClassicCursor;
    if (!replay) return;
    const frames = replay.frames;

    const pi = findIndexInReplayAtTime(frames, time);
    // we are either before the beginning or after the end of the replay
    if (pi === -1 || pi + 1 >= frames.length) return;

    // console.log(pi);
    const position = interpolateReplayPosition(frames[pi], frames[pi + 1], time);

    const trailPositions: Position[] = [];
    const numberOfTrailSprites = 8;
    if (showTrail) {
      if (smoothCursorTrail) {
        const fps = 144;
        const deltaCursorSmoothingTime = Math.floor(1000 / fps);
        let t = time - deltaCursorSmoothingTime,
          j = pi + 1;
        while (j > 0 && trailPositions.length < numberOfTrailSprites) {
          while (j > 0 && frames[j - 1].time > t) {
            j--;
          }
          if (j === 0) {
            trailPositions.push(frames[j].position);
          } else {
            trailPositions.push(interpolateReplayPosition(frames[j - 1], frames[j], t));
          }
          t -= deltaCursorSmoothingTime;
        }
      } else {
        for (let i = 1; i <= numberOfTrailSprites && pi - i >= 0; i++) {
          trailPositions.push(frames[pi - i].position);
        }
      }
    }

    cursor.prepare({
      position,
      trailPositions,
      cursorScale: scale,
      cursorTexture: skin.getTexture("CURSOR"),
      cursorTrailTexture: skin.getTexture("CURSOR_TRAIL"),
    });

    this.container.addChild(cursor.container);
  }

  get replay() {
    return this.replayManager.getMainReplay();
  }

  updateAnalysisCursor() {
    const { replay, time, analysisCursorSettings } = this;
    const { enabled } = analysisCursorSettings;
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

    const interesting: boolean[] = [];
    const masks: number[] = [];
    // the interesting rule can be changed...

    const points: AnalysisPoint[] = [];
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
      analysisCursorSettings.colorNoKeys,
      analysisCursorSettings.colorKey1,
      analysisCursorSettings.colorKey2,
      analysisCursorSettings.colorBothKeys,
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

  updateCursors() {
    this.container.removeChildren();
    this.updateOsuCursor();
    this.updateAnalysisCursor();
  }

  getContainer() {
    return this.container;
  }
}
