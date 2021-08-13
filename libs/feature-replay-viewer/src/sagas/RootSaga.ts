import { spawn } from "redux-saga/effects";
import { watchScenarioChangeRequests } from "../theater/saga";
import { watchReplaysAdded } from "../replays/ReplayFolderWatchSaga";

// Maybe url ?
type Options = {
  watchReplayFolder: boolean;
};
const defaultOptions: Options = {
  watchReplayFolder: true,
};

// TODO: Maybe it's better to just compose it at the application...
export function createRewindRootSaga(options: Options) {
  const url = "http://localhost:7271";
  const { watchReplayFolder } = Object.assign({ ...defaultOptions }, options);
  return function* () {
    yield spawn(watchScenarioChangeRequests);
    if (watchReplayFolder) {
      yield spawn(watchReplaysAdded, url);
    }
  };
}

// Future ideas:
// * Beatmap added
