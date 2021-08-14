import { Scene } from "../game/Scene";

// class Director {
//   getCurrentScene(): Scene {
//     const { skin, beatmap, replay, judgements, background } = this;
//     const time = this.gameClock.getCurrentTime();
//     const gameplayState = this.gameplayTimeMachine?.gameStateAt(time);
//     const gameplayInfo = gameplayState ? this.gameplayEvaluator.evaluateReplayState(gameplayState) : undefined;
//
//     return {
//       time,
//       gameplayState,
//       beatmap,
//       replay,
//       gameplayInfo,
//       skin,
//       judgements,
//       view: this._view,
//       backgroundUrl,
//     };
//   }
// }
