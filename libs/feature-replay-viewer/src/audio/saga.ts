import { takeEvery } from "redux-saga/effects";
import { gameClockStarted } from "../clocks/slice";

export function createAudioSaga() {
  function* handleGameClockStop() {
    // Audio stop
    // Stop the sample queue
  }

  // Audio start if it's actually possible with the given play back rate.

  function* watchGameClockStop() {
    yield takeEvery(gameClockStarted.type, handleGameClockStop);
  }

  function* watchAudioLoadRequested() {}

  // Or just return some "rootSaga" ? Cause 100% you want to watch for everything
  return { watchAudioLoadRequested, watchGameClockStop };
}
