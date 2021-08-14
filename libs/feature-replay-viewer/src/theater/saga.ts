import { all, call, cancelled, fork, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { Action } from "@reduxjs/toolkit";
import { Blueprint, buildBeatmap, OsuClassicMod } from "@rewind/osu/core";
import { retrieveBlueprint } from "../blueprints/BlueprintSaga";
import { retrieveReplay } from "../replays/ReplaySaga";
import { scenarioChangeRequested } from "./actions";
import { gameClockPlaybackRateChanged } from "../clocks/slice";
import { theaterViewChanged } from "./slice";
import { ViewSettings } from "../game/ViewSettings";
import produce from "immer";
import { OsuReplay } from "../replays/slice";
import { preferencesViewSelector } from "../preferences/slice";

// TODO: Move @core
function determineDefaultPlaybackSpeed(mods: OsuClassicMod[]) {
  for (let i = 0; i < mods.length; i++) {
    if (mods[i] === "DOUBLE_TIME" || mods[i] === "HALF_TIME") return 1.5;
    if (mods[i] === "HALF_TIME") return 0.75;
  }
  return 1.0;
}

// This saga changes the theater
export function createTheaterSaga() {
  function* changeScenario(action: Action): SagaIterator {
    if (!scenarioChangeRequested.match(action)) {
      return;
    }
    const { blueprintId, replayId } = action.payload;

    try {
      const [blueprint, replay]: [Blueprint, OsuReplay] = yield all([
        call(retrieveBlueprint, blueprintId),
        call(retrieveReplay, replayId),
      ]);
      // Load background texture
      // Load audio.mp3
      const { mods } = replay;

      const beatmap = buildBeatmap(blueprint, { mods, addStacking: true });

      // Change view settings with adjustments such as hidden enabled
      const modHiddenEnabled = mods.includes("HIDDEN");
      const viewSettings: ViewSettings = yield select(preferencesViewSelector);
      const adjustedViewSettings = produce(viewSettings, (draft) => {
        draft.modHidden = modHiddenEnabled;
      });
      yield put(theaterViewChanged(adjustedViewSettings));

      // Change speed according to mod
      const defaultPlaybackSpeed = determineDefaultPlaybackSpeed(mods);
      yield put(gameClockPlaybackRateChanged(defaultPlaybackSpeed));
    } finally {
      if (yield cancelled()) {
        console.log(`Scenario change (blueprint=${blueprintId}, replay=${replayId}) was cancelled`);
      }
    }
  }

  function* watchScenarioChangeRequests() {
    // We take the latest in case the user makes multiple requests (such as pressing F2 twice on accident on score screen)
    // This will cancel the previous ones so that we don't get weird effects.
    yield takeLatest(scenarioChangeRequested.type, changeScenario);
  }

  function handleTheaterViewChanged(action: Action) {
    if (!theaterViewChanged.match(action)) return;
    const viewSettings = action.payload;
  }

  function* watchTheaterViewChanged() {
    yield takeEvery(theaterViewChanged.type, handleTheaterViewChanged);
  }

  function* theaterRootSaga() {
    yield fork(watchScenarioChangeRequests);
    yield fork(watchTheaterViewChanged);
  }

  return { theaterRootSaga };
}
