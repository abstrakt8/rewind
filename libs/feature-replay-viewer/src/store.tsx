import { configureStore } from "@reduxjs/toolkit";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import preferencesReducer from "./preferences/slice";

const reducer = {
  localBlueprintInfo: localBlueprintInfoReducer,
  preferences: preferencesReducer,
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
