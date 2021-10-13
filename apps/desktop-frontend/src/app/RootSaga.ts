import { call, delay, put, spawn, take } from "redux-saga/effects";
import { API_BASE_URL } from "./backend/constants";
import { BackendState, stateChanged } from "./backend/slice";
import { SagaIterator } from "redux-saga";
import { push } from "connected-react-router";
import { RewindTheater } from "@rewind/web-player/rewind";

function* waitForBackendState(state: BackendState): SagaIterator {
  while (true) {
    const action = yield take(stateChanged.type);
    if (stateChanged.match(action) && action.payload === state) {
      break;
    }
  }
}

function* watchForBackendReady(theater: RewindTheater): SagaIterator {
  const { common, analyzer } = theater;
  yield call(waitForBackendState, "READY");
  yield put(push("/home")); // Theater
  yield call(common.initialize.bind(common));
  yield call(analyzer.initialize.bind(analyzer));
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

export function createRewindRootSaga({ theater }: { theater: RewindTheater }) {
  return function* () {
    yield spawn(watchForBackendMissingSetup);
    yield spawn(watchForBackendReady, theater);
    yield spawn(busyPollBackendState);
  };
}
