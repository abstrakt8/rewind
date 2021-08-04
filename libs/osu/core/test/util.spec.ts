import * as fs from "fs";
import * as path from "path";
import { readSync } from "node-osr";
import { normalizeHitObjects } from "../src/utils";
import { hitWindowsForOD } from "@rewind/osu/math";
import {
  OsuBlueprintParser,
  Blueprint,
  fromRawToReplay,
  ReplayState,
  OsuHitObject,
  Slider,
  defaultReplayState,
  NextFrameEvaluator,
  buildBeatmap,
  NextFrameEvaluatorOptions,
  NoteLockStyle,
} from "../src";

// This makes the whole testing module node.js only

export function parseBlueprintFromFS(name: string): Blueprint {
  const data = fs.readFileSync(name);
  const parser = new OsuBlueprintParser(data.toString());
  return parser.parse();
}

const rewindTestOsuDir = process.env.REWIND_TEST_OSU_DIR || "";

export function osuMapPath(name: string): string {
  return path.join(rewindTestOsuDir, "Songs", name);
}

export function replayPath(name: string): string {
  return path.join(rewindTestOsuDir, "Replays", name);
}

export function parseReplayFromFS(replayFile: string) {
  const r = readSync(replayFile);
  return fromRawToReplay(r.replay_data);
}

export const TEST_MAPS = {
  ONE_SLIDER: osuMapPath("967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Slider 1].osu"),
  SLIDER_WITH_ONE_REPEAT: osuMapPath(
    "967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Slider (Repeat = 1)].osu",
  ),
  SHORT_KICK_SLIDER: osuMapPath("967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Short kick slider].osu"),
  VIOLET_PERFUME: osuMapPath("1010865 SHK - Violet Perfume [no video]/SHK - Violet Perfume (ktgster) [Insane].osu"),
  GERA_GERA: osuMapPath(
    "1001507 ZUTOMAYO - Kan Saete Kuyashiiwa/ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu",
  ),
  SUN_MOON_STAR: osuMapPath(
    "933630 Aether Realm - The Sun, The Moon, The Star/Aether Realm - The Sun, The Moon, The Star (ItsWinter) [Mourning Those Things I've Long Left Behind].osu",
  ),
};

export const TEST_REPLAYS = {
  SUN_MOON_STAR_VARVALIAN: replayPath(
    "Varvalian - Aether Realm - The Sun, The Moon, The Star [Mourning Those Things I've Long Left Behind] (2019-05-15) Osu.osr",
  ),
};

// This allows us to easily test
export function osuClassicScoreScreenJudgementCount(
  state: ReplayState,
  hitObjects: OsuHitObject[],
  osuLazer?: boolean,
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
  const state = defaultReplayState();
  for (const frame of replay) {
    evaluator.evaluateNextFrameMutated(state, frame);
  }
  return state;
}

export function defaultStableSettings(mapFile: string) {
  const blueprint = parseBlueprintFromFS(mapFile);
  const beatmap = buildBeatmap(blueprint);
  const hitObjects = beatmap.hitObjects;
  const hitWindows = hitWindowsForOD(blueprint.defaultDifficulty.overallDifficulty);

  const settings: NextFrameEvaluatorOptions = {
    hitWindows,
    noteLockStyle: NoteLockStyle.STABLE,
  };

  const evaluator = new NextFrameEvaluator(beatmap, settings);

  return {
    beatmap,
    hitObjects,
    settings,
    evaluator,
    hitWindows,
  };
}
