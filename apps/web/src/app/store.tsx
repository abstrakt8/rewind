import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { useDispatch } from "react-redux";
import { createRewindRootSaga } from "../../../../libs/feature-replay-viewer/src/sagas/RootSaga";
import { rewindApi } from "../../../../libs/feature-replay-viewer/src/api";

const reducer = {
  [rewindApi.reducerPath]: rewindApi.reducer,
};
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware).concat(rewindApi.middleware),
});

// TODO: https://redux-toolkit.js.org/rtk-query/overview ?
// setupListeners(store.dispatch)

// TODO: Run it here?
sagaMiddleware.run(createRewindRootSaga({ watchReplayFolder: true }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types

export default store;
