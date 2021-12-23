import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import backendReducer from "./backend/slice";
import settingsReducer from "./settings/slice";
import updaterReducer from "./update/slice";
import { createRewindRootSaga } from "./RootSaga";
import { rewindDesktopApi } from "./backend/api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { theater } from "./theater";

const reducer = {
  backend: backendReducer,
  settings: settingsReducer,
  updater: updaterReducer,
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
    getDefaultMiddleware().concat(sagaMiddleware).concat(rewindDesktopApi.middleware),
});

// Setting up redux-toolkit API listeners
setupListeners(store.dispatch);

sagaMiddleware.run(createRewindRootSaga({ theater }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
