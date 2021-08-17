import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import replayReducer from "./replays/slice";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import rawBlueprintReducer from "./blueprints/RawBlueprint";
import gameClockReducer from "./clocks/slice";
import preferencesReducer from "./preferences/slice";
import theaterReducer from "./theater/slice";
import { createRewindRootSaga } from "./sagas/RootSaga";
import { PerformanceGameClock } from "./clocks/PerformanceGameClock";
import { createRewindStage } from "./app/stage";

const sagaMiddleware = createSagaMiddleware();

const reducer = {
  localBlueprintInfo: localBlueprintInfoReducer,
  rawBlueprint: rawBlueprintReducer,
  replay: replayReducer,
  gameClock: gameClockReducer,
  preferences: preferencesReducer,
  theater: theaterReducer,
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

const gameClock = new PerformanceGameClock();

// TODO: Run it here?
sagaMiddleware.run(createRewindRootSaga({ gameClock, watchReplayFolder: true }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface EssentialStore {
  dispatch: AppDispatch;
  getState: () => RootState;
}

export default store;
