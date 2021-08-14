import { spawn } from "redux-saga/effects";
import { createTheaterSaga } from "../theater/saga";
import { watchReplaysAdded } from "../replays/ReplayFolderWatchSaga";
import { SagaIterator } from "redux-saga";
import { createGameClockSaga } from "../clocks/saga";
import { PerformanceGameClock } from "../clocks/PerformanceGameClock";
import { GameClock } from "../clocks/GameClock";

// Maybe url ?
type Options = {
  gameClock: GameClock;
  watchReplayFolder: boolean;
};
const defaultOptions: Options = {
  gameClock: new PerformanceGameClock(),
  watchReplayFolder: true,
};

// TODO: Maybe it's better to just compose it at the application...
export function createRewindRootSaga(options: Options) {
  const url = "http://localhost:7271";
  const { gameClock, watchReplayFolder } = Object.assign({ ...defaultOptions }, options);

  const { theaterRootSaga } = createTheaterSaga();
  const { watchGameClockRoot } = createGameClockSaga(gameClock);

  return function* () {
    yield spawn(theaterRootSaga);
    yield spawn(watchGameClockRoot);
    if (watchReplayFolder) {
      yield spawn(watchReplaysAdded, url);
    }
  };
}

// Future ideas:
// * Beatmap added
