import { Container } from "pixi.js";
import { OsuClassicCursor } from "@rewind/osu-pixi/classic-components";
import { findIndexInReplayAtTime, interpolateReplayPosition } from "../../../Replay";
import { AnalysisCursor, AnalysisPoint } from "@rewind/osu-pixi/rewind";
import { OsuAction } from "@rewind/osu/core";
import { injectable } from "inversify";
import { GameplayClock } from "../../../core/game/GameplayClock";
import { SkinHolder } from "../../../core/skins/SkinHolder";
import { ReplayManager } from "../../../apps/analysis/manager/ReplayManager";
import { AnalysisCursorSettingsStore } from "../../../services/AnalysisCursorSettingsStore";
import { ReplayCursorSettingsStore } from "../../../services/ReplayCursorSettingsStore";
import { Position } from "@rewind/osu/math";

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
    const { enabled, scaleWithCS, scale, showTrail } = this.replayCursorSettingsStore.settings;

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
    if (showTrail) {
      for (let i = 1; i <= 5 && pi - i >= 0; i++) {
        trailPositions.push(frames[pi - i].position);
      }
    }

    // For motion blurring or similar
    // const velocity = Vec2.sub(frames[pi + 1].position, frames[pi].position).divide(
    //   frames[pi + 1].time - frames[pi].time,
    // );

    cursor.prepare({
      position,
      trailPositions,
      cursorScale: scale,
      cursorTexture: skin.getTexture("CURSOR"),
      cursorTrailTexture: skin.getTexture("CURSOR_TRAIL"),
    });

    // console.log(velocity);

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

  update() {
    this.container.removeChildren();
    this.updateOsuCursor();
    this.updateAnalysisCursor();
  }

  getContainer() {
    return this.container;
  }
}
