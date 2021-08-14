import { GameClock } from "./GameClock";
import { fork, takeEvery } from "redux-saga/effects";
import { gameClockPaused, gameClockPlaybackRateChanged, gameClockStarted } from "./slice";
import { Action } from "@reduxjs/toolkit";

// Some thoughts: Since the game clock is an "external source" maybe it should be better to separate the actions
// between "requested" and "actually happened", e.g. at the press of a button "gameClockStopRequested" is dispatched,
// which in turn will request the game clock to stop. If the request is accepted and the clock got stopped we can
// then dispatch a "gameClockStopped". Right now it's not a problem ... so we keep it like this.
export function createGameClockSaga(gameClock: GameClock) {
  function* watchGameClockStopped() {
    yield takeEvery(gameClockPaused.type, () => gameClock.pause());
  }

  function* watchGameClockStarted() {
    yield takeEvery(gameClockStarted.type, () => gameClock.start());
  }

  // We do not watch for actions such as playbackRateIncreased, instead they should dispatch playbackRateChanged
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

  return { watchGameClockRoot };
}
