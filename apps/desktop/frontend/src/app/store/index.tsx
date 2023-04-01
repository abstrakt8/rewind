import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./settings/slice";
import updaterReducer from "./update/slice";
import { setupListeners } from "@reduxjs/toolkit/query";

// TODO: Maybe remove and just use RXJS only

const reducer = {
  settings: settingsReducer,
  updater: updaterReducer,
};

const isDev = process.env.NODE_ENV !== "production" && false;
const preloadedState = {
  router: {},
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
});

// Setting up redux-toolkit API listeners
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
