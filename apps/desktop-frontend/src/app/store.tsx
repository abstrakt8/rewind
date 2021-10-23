import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import backendReducer from "./backend/slice";
import settingsReducer from "./settings/slice";
import { createRewindRootSaga } from "./RootSaga";
import { createHashHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { rewindDesktopApi } from "./backend/api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { theater } from "./theater";

export const history = createHashHistory({});

const reducer = {
  router: connectRouter(history),
  backend: backendReducer,
  settings: settingsReducer,
  [rewindDesktopApi.reducerPath]: rewindDesktopApi.reducer,
};

const sagaMiddleware = createSagaMiddleware();

const isDev = process.env.NODE_ENV !== "production" && false;
const preloadedState = {
  router: {},
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware).concat(routerMiddleware(history)).concat(rewindDesktopApi.middleware),
});

setupListeners(store.dispatch);

sagaMiddleware.run(createRewindRootSaga({ theater }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
