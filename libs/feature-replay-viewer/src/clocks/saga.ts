import { GameClock } from "./GameClock";
import { fork, takeEvery } from "redux-saga/effects";
import { gameClockPaused, gameClockPlaybackRateChanged, gameClockStarted } from "./slice";
import { Action } from "@reduxjs/toolkit";

export function createGameClockSaga(gameClock: GameClock) {
  function* watchGameClockStopped() {
    yield takeEvery(gameClockPaused.type, () => gameClock.pause());
  }

  function* watchGameClockStarted() {
    yield takeEvery(gameClockStarted.type, () => gameClock.start());
  }

  function handleGameClockPlaybackRateChanged(action: Action) {
    if (!gameClockPlaybackRateChanged.match(action)) return;
    const playbackRate = action.payload;
    gameClock.setSpeed(playbackRate);
  }

  function* watchGameClockPlaybackRateChanged() {
    yield takeEvery(gameClockPlaybackRateChanged.type, handleGameClockPlaybackRateChanged);
  }

  function* watchGameClockRoot() {
    yield fork(watchGameClockStarted);
    yield fork(watchGameClockStopped);
    yield fork(watchGameClockPlaybackRateChanged);
  }

  return watchGameClockRoot;
}
