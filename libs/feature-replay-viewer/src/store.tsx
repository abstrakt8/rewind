import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import replayReducer from "./replays/slice";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import rawBlueprintReducer from "./blueprints/RawBlueprint";
import gameClockReducer from "./clocks/slice";
import preferencesReducer from "./preferences/slice";
import theaterReducer from "./theater/slice";
import { createRewindRootSaga } from "./sagas/RootSaga";
import { PerformanceGameClock } from "./clocks/PerformanceGameClock";

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

// TODO: https://redux-toolkit.js.org/rtk-query/overview ?
// setupListeners(store.dispatch)

const gameClock = new PerformanceGameClock();
console.log("Create rewind root saga", createRewindRootSaga);
const rootSaga = createRewindRootSaga({ watchReplayFolder: true });

// TODO: Run it here?
// sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
