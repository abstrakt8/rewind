import { spawn } from "redux-saga/effects";
import { watchReplaysAdded } from "./replays/watchReplaysAdded";

interface Settings {
  url: string;
}

export function createRewindRootSaga({ url }: Settings) {
  return function* () {
    yield spawn(watchReplaysAdded, url);
  };
}
