import { call, put, spawn, take, delay } from "redux-saga/effects";
import { watchReplaysAdded } from "./replays/watchReplaysAdded";
import { API_BASE_URL, REWIND_WS_URL } from "./backend/constants";
import { BackendState, stateChanged } from "./backend/slice";
import { SagaIterator } from "redux-saga";
import { push } from "connected-react-router";

function* waitForBackendState(state: BackendState): SagaIterator {
  while (true) {
    const action = yield take(stateChanged.type);
    if (stateChanged.match(action) && action.payload === state) {
      break;
    }
  }
}

function* watchForBackendReady(): SagaIterator {
  yield call(waitForBackendState, "READY");
  yield spawn(watchReplaysAdded, REWIND_WS_URL);
  yield put(push("/home")); // Theater
}

function* watchForBackendMissingSetup(): SagaIterator {
  yield call(waitForBackendState, "SETUP_MISSING");
  yield put(push("/setup"));
}

async function fetchStatus(): Promise<BackendState> {
  try {
    const status = await fetch(`${API_BASE_URL}/status`);
    if (!status.ok) {
      return "NOT_STARTED";
    }
    const data = await status.json();
    return data.status as BackendState;
  } catch (err) {
    // Assumption is that it hasn't started yet ... but we could be more specific in the future
    return "NOT_STARTED";
  }
}

const BACKEND_STATE_BUSY_POLL_DURATION_IN_MS = 500;

function* busyPollBackendState(): SagaIterator {
  let state: BackendState = "NOT_STARTED"; // Maybe select from store?
  while (state === "NOT_STARTED" || state === "LOADING") {
    const newState: BackendState = yield call(fetchStatus);
    if (newState !== state) {
      yield put(stateChanged(newState));
      state = newState;
    }
    yield delay(BACKEND_STATE_BUSY_POLL_DURATION_IN_MS);
  }
}

export function createRewindRootSaga() {
  return function* () {
    yield spawn(watchForBackendMissingSetup);
    yield spawn(watchForBackendReady);
    yield spawn(busyPollBackendState);
  };
}
