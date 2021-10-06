import { createSlice } from "@reduxjs/toolkit";

interface RewindSettingsState {
  open: boolean;
}

const initialState: RewindSettingsState = {
  open: false,
};

const rewindSettingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    settingsModalClosed(state) {
      state.open = false;
    },
    settingsModalOpened(state) {
      state.open = true;
    },
  },
});

export const { settingsModalClosed, settingsModalOpened } = rewindSettingsSlice.actions;
export default rewindSettingsSlice.reducer;
