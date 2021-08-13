import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { useDispatch } from "react-redux";
import replayReducer from "./replays/slice";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import rawBlueprintReducer from "./blueprints/RawBlueprint";
import gameClockReducer from "./clocks/slice";
import preferencesReducer from "./preferences/slice";
import { createRewindRootSaga } from ".";

const sagaMiddleware = createSagaMiddleware();

const reducer = {
  localBlueprintInfo: localBlueprintInfoReducer,
  rawBlueprint: rawBlueprintReducer,
  replay: replayReducer,
  gameClock: gameClockReducer,
  preferences: preferencesReducer,
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

// TODO: https://redux-toolkit.js.org/rtk-query/overview ?
// setupListeners(store.dispatch)

// TODO: Run it here?
sagaMiddleware.run(createRewindRootSaga({ watchReplayFolder: true }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types

export default store;
