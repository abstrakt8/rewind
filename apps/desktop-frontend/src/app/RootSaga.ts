import { spawn } from "redux-saga/effects";
import { watchReplaysAdded } from "./replays/watchReplaysAdded";

interface Settings {
  url: string;
}

export function createRewindRootSaga({ url }: Settings) {
  return function* () {
    // Well you could spawn them, but maybe only after the backend is ready?
    yield spawn(watchReplaysAdded, url);
  };
}
