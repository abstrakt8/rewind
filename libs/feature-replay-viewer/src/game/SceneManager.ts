import { Scene } from "./Scenario";
import { GameClock } from "../clocks/GameClock";
import {
  Beatmap,
  BucketedReplayStateTimeMachine,
  GameplayInfoEvaluator,
  NoteLockStyle,
  ReplayStateTimeMachine,
} from "@rewind/osu/core";
import { OsuReplay } from "../managers/ReplayManager";
import { hitWindowsForOD } from "@rewind/osu/math";
import { EmptySkin, Skin } from "../skins/Skin";
import { defaultViewSettings, ViewSettings } from "../ViewSettings";

// A scene defines what should be drawn on the screen.
// The scene manager is almost equivalent to the store in Redux and PixiJS is just the underlying rendering platform.
class SceneManager {
  private gameplayTimeMachine: ReplayStateTimeMachine;
  private skin: Skin;
  private view: ViewSettings;

  constructor(public gameClock: GameClock, public beatmap: Beatmap, public replay: OsuReplay) {
    this.gameplayTimeMachine = new BucketedReplayStateTimeMachine(replay.frames, beatmap, {
      hitWindows: hitWindowsForOD(beatmap.difficulty.overallDifficulty),
      noteLockStyle: NoteLockStyle.STABLE,
    });
    this.skin = Skin.EMPTY;
    this.view = defaultViewSettings();
  }

  loadCurrentScene(): Scene {
    const { skin, beatmap, replay, view } = this;
    const time = this.gameClock.getCurrentTime();
    const gameplayState = this.gameplayTimeMachine.replayStateAt(time);
    const gameplayInfo = new GameplayInfoEvaluator(this.beatmap, {}).evaluateReplayState(gameplayState);

    return {
      time,
      gameplayState,
      beatmap,
      replay,
      gameplayInfo,
      skin,
      view,
    };
  }
}
