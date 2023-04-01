import * as fs from "fs";
import { readSync } from "node-osr";
import {
  Blueprint,
  BucketedGameStateTimeMachine,
  buildBeatmap,
  defaultGameState,
  GameState,
  GameStateEvaluator,
  GameStateEvaluatorOptions,
  modsFromBitmask,
  normalizeHitObjects,
  OsuClassicMod,
  OsuHitObject,
  parseBlueprint,
  parseReplayFramesFromRaw,
  ReplayFrame,
  Slider,
} from "@osujs/core";
import { formatGameTime, hitWindowsForOD, Position } from "@osujs/math";
import { average, max, median, min } from "simple-statistics";

// This makes the whole testing module node.js only

export function assertPositionEqual(actual: Position, expected: Position, numDigits?: number) {
  expect(actual.x).toBeCloseTo(expected.x, numDigits);
  expect(actual.y).toBeCloseTo(expected.y, numDigits);
}

export function parseBlueprintFromFS(name: string): Blueprint {
  const data = fs.readFileSync(name);
  return parseBlueprint(data.toString());
}

export function parseReplayFramesFromFS(replayFile: string) {
  const r = readSync(replayFile);
  return parseReplayFramesFromRaw(r.replay_data);
}

interface TestReplay {
  frames: ReplayFrame[];
  mods: OsuClassicMod[];
}

export function parseReplayFromFS(replayFile: string): TestReplay {
  const r = readSync(replayFile);

  return {
    mods: modsFromBitmask(r.mods),
    frames: parseReplayFramesFromRaw(r.replay_data),
  };
}

// this code  is so messy but should be replaced with something else anyways
export function osuClassicScoreScreenJudgementCount(state: GameState, hitObjects: OsuHitObject[], osuLazer?: boolean) {
  const count = [0, 0, 0, 0];
  const dict = normalizeHitObjects(hitObjects);
  const HitObjectVerdicts = {
    GREAT: 0,
    OK: 1,
    MEH: 2,
    MISS: 3,
  } as const;

  for (const s of Object.values(state.hitCircleVerdict)) {
    count[HitObjectVerdicts[s.type]]++;
  }
  for (const id in state.sliderVerdict) {
    const j = state.sliderVerdict[id];
    count[HitObjectVerdicts[j]]++;
    const slider = dict[id] as Slider;

    // In osu!classic the heads are not counted and we just subtract them
    const headState = state.hitCircleVerdict[slider.head.id];
    if (!headState) throw Error("Head state was not calculated?");
    count[headState.type]--;
  }

  return count;
}

export function evaluateWholeReplay(evaluator: GameStateEvaluator, replay: ReplayFrame[]) {
  const state = defaultGameState();
  for (const frame of replay) {
    evaluator.evaluate(state, frame);
  }
  return state;
}

export function defaultStableSettings(mapFile: string) {
  const blueprint = parseBlueprintFromFS(mapFile);
  const beatmap = buildBeatmap(blueprint);
  const hitObjects = beatmap.hitObjects;
  const hitWindows = hitWindowsForOD(blueprint.defaultDifficulty.overallDifficulty);

  const settings: GameStateEvaluatorOptions = {
    hitWindowStyle: "OSU_STABLE",
    noteLockStyle: "STABLE",
  };

  const evaluator = new GameStateEvaluator(beatmap, settings);

  return {
    beatmap,
    hitObjects,
    settings,
    evaluator,
    hitWindows,
  };
}

export function createTestTimeMachine(mapFile: string, replayFile: string) {
  const blueprint = parseBlueprintFromFS(mapFile);
  const replay = parseReplayFromFS(replayFile);
  const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });
  const timeMachine = new BucketedGameStateTimeMachine(replay.frames, beatmap, {
    hitWindowStyle: "OSU_STABLE",
    noteLockStyle: "STABLE",
  });

  return {
    blueprint,
    replay,
    beatmap,
    timeMachine,
  };
}

// Time deltas
export function timeDeltas(frames: { time: number }[]) {
  const deltas: number[] = [];
  for (let i = 1; i < frames.length; i++) {
    deltas.push(frames[i].time - frames[i - 1].time);
  }
  return deltas;
}

export function commonStats(frames: ReplayFrame[], outlierMs = 16 * 2) {
  const t = timeDeltas(frames);
  const med = median(t);
  const avg = average(t);
  const mn = min(t);
  const mx = max(t);

  let time = 0;
  for (let i = 0; i < t.length; i++) {
    time += t[i];
    // 2 Frames lost
    if (t[i] >= outlierMs) {
      console.log(`Outlier at t=${formatGameTime(time, true)} with delta = ${t[i]}`);
    }
  }

  console.log(`Max=${mx} , Min=${mn}, Avg=${avg}, Median=${med}`);
}
