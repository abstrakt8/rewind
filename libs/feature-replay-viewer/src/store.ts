import { configureStore } from "@reduxjs/toolkit";
import renderSettingsReducer from "./render-settings/slice";
import clockReducer from "./clocks/slice";

const store = configureStore({
  reducer: {
    renderSettings: renderSettingsReducer,
    clock: clockReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
