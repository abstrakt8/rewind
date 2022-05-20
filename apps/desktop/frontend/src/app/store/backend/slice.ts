import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Maybe NOT_STARTED and SETUP_MISSING are just "ERROR"
export type BackendState = "NOT_STARTED" | "SETUP_MISSING" | "LOADING" | "READY";

// TODO: Remove
interface BackendStatus {
  status: BackendState;
}

const initialState: BackendStatus = {
  status: "NOT_STARTED",
};

const backendSlice = createSlice({
  name: "backend",
  initialState,
  reducers: {
    stateChanged(draft, action: PayloadAction<BackendState>) {
      draft.status = action.payload;
    },
  },
});

export const { stateChanged } = backendSlice.actions;

export default backendSlice.reducer;
