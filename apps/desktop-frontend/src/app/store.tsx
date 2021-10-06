import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import backendReducer from "./backend/slice";
import settingsReducer from "./settings/slice";
import { createRewindRootSaga } from "./RootSaga";
import { createHashHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { rewindDesktopApi } from "./backend/api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const history = createHashHistory();

const reducer = {
  router: connectRouter(history),
  localBlueprintInfo: localBlueprintInfoReducer,
  backend: backendReducer,
  settings: settingsReducer,
  [rewindDesktopApi.reducerPath]: rewindDesktopApi.reducer,
};

const sagaMiddleware = createSagaMiddleware();

const isDev = process.env.NODE_ENV !== "production" && false;
const preloadedState = {};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware).concat(routerMiddleware(history)).concat(rewindDesktopApi.middleware),
  preloadedState,
});

setupListeners(store.dispatch);

sagaMiddleware.run(createRewindRootSaga());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
