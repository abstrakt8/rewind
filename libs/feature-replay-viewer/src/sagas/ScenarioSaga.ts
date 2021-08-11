import { all, cancelled, takeLatest, call } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { Action, createAction } from "@reduxjs/toolkit";

type Payload = {
  blueprintId: string;
  replayId: string;
};

export const scenarioChangeRequested = createAction<Payload>("SCENARIO_CHANGE_REQUESTED");

function* fetchBlueprint(blueprintId: string) {
  yield "";
}

function* fetchReplay(replayId: string) {
  yield "";
}

// This saga changes the scenario
function* changeScenario(action: Action): SagaIterator {
  if (!scenarioChangeRequested.match(action)) {
    return;
  }

  try {
    const { blueprintId, replayId } = action.payload;
    console.log(`Scenario change ${blueprintId} ${replayId}`);
    const [blueprint, replay] = yield all([call(fetchBlueprint, blueprintId), call(fetchReplay, replayId)]);
  } finally {
    if (yield cancelled()) {
      console.log("Scenario change cancelled");
    }
  }
}

export function* watchScenarioChange() {
  yield takeLatest(scenarioChangeRequested.type, changeScenario);
}

/**
 * WebSocket <-> ReceiveReplayAdded -> changeScenario or showNotification based on settings
 */
