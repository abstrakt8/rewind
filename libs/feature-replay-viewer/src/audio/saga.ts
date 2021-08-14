import { apply, call, fork, takeEvery } from "redux-saga/effects";
import { gameClockPaused, gameClockStarted } from "../clocks/slice";
import { AudioManager } from "./manager";

export function* audioSaga(audioManager: AudioManager) {
  // Audio start if it's actually possible with the given play back rate.
  function* watchGameClockStarted() {
    yield takeEvery(gameClockStarted.type, () => audioManager.start());
  }

  // Audio start if it's actually possible with the given play back rate.
  function* watchGameClockPaused() {
    yield takeEvery(gameClockPaused.type, () => audioManager.pause());
  }

  function* watchAudioLoadRequested() {}

  yield fork(watchAudioLoadRequested);
  yield fork(watchGameClockStarted);
  yield fork(watchGameClockPaused);
}
