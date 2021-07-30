import {
  BeatmapBuilder,
  fromRawToReplay,
  getDefaultReplayState,
  NextFrameEvaluator,
  NoteLockStyle,
  OsuBlueprintParser,
  OsuHitObject,
  OsuStdJudgmentSettings,
  ReplayState,
  Slider,
} from "../src";
import fs from "fs";
import { Blueprint } from "../src/blueprint/Blueprint";
import path from "path";
import nodeOsr from "node-osr";
import { normalizeHitObjects } from "../src/utils";
import { hitWindowsForOD } from "osu-math";

// This makes the whole testing module node.js only

export function parseBlueprintFromFS(name: string): Blueprint {
  const data = fs.readFileSync(name);
  const parser = new OsuBlueprintParser(data.toString());
  return parser.parse();
}

// TODO: Replace those with the others
// Or use enviornment variables
export function realMapPath(name: string) {
  return path.join("..", "..", "resources", "osu!", "Songs", name);
}

export function realReplayPath(name: string) {
  return path.join("..", "..", "resources", "osu!", "Replays", name);
}

export function osuMapPath(name: string): string {
  return path.join("resources", "maps", name);
}

export function replayPath(name: string): string {
  return path.join("resources", "replays", name);
}

export function parseReplayFromFS(replayFile: string) {
  const r = nodeOsr.readSync(replayFile);
  return fromRawToReplay(r.replay_data);
}

export const TEST_MAPS = {
  ONE_SLIDER: osuMapPath("Perfume - Daijobanai (eiri-) [Slider 1].osu"),
  SLIDER_WITH_ONE_REPEAT: osuMapPath("Perfume - Daijobanai (eiri-) [Slider (Repeat = 1)].osu"),
  SHORT_KICK_SLIDER: osuMapPath("Perfume - Daijobanai (eiri-) [Short kick slider].osu"),
  VIOLET_PERFUME: osuMapPath("SHK - Violet Perfume (ktgster) [Insane].osu"),
  GERA_GERA: osuMapPath("ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu"),
  SUN_MOON_STAR: realMapPath(
    "933630 Aether Realm - The Sun, The Moon, The Star/Aether Realm - The Sun, The Moon, The Star (ItsWinter) [Mourning Those Things I've Long Left Behind].osu"
  ),
};

export const TEST_REPLAYS = {
  SUN_MOON_STAR_VARVALIAN: realReplayPath(
    "Varvalian - Aether Realm - The Sun, The Moon, The Star [Mourning Those Things I've Long Left Behind] (2019-05-15) Osu.osr"
  ),
};

// This allows us to easily test
export function osuClassicScoreScreenJudgementCount(
  state: ReplayState,
  hitObjects: OsuHitObject[],
  osuLazer?: boolean
) {
  const count = [0, 0, 0, 0];
  const dict = normalizeHitObjects(hitObjects);

  for (const s of state.hitCircleState.values()) {
    count[s.type]++;
  }
  for (const [id, j] of state.sliderJudgement.entries()) {
    count[j]++;
    const slider = dict[id] as Slider;

    // In osu!classic the heads are not counted and we just subtract them
    const headState = state.hitCircleState.get(slider.head.id);
    if (!headState) throw Error("Head state was not calculated?");
    count[headState.type]--;
  }

  return count;
}

export function evaluateWholeReplay(evaluator: NextFrameEvaluator, replay: any[]) {
  const state = getDefaultReplayState();
  for (const frame of replay) {
    evaluator.evaluateNextFrameMutated(state, frame);
  }
  return state;
}

export function defaultStableSettings(mapFile: string) {
  const blueprint = parseBlueprintFromFS(mapFile);
  const beatmapBuilder = new BeatmapBuilder(true);
  const beatmap = beatmapBuilder.buildBeatmap(blueprint, []);
  const hitObjects = beatmap.hitObjects;
  const hitWindows = hitWindowsForOD(blueprint.defaultDifficulty.overallDifficulty);

  const settings: OsuStdJudgmentSettings = {
    hitWindows,
    noteLockStyle: NoteLockStyle.STABLE,
  };

  const evaluator = new NextFrameEvaluator(hitObjects, settings);

  return {
    hitObjects,
    settings,
    evaluator,
    hitWindows,
  };
}
