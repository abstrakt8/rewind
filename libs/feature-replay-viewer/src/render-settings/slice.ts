import { createSlice } from "@reduxjs/toolkit";

// Basically everything that is relevant to the canvas is shown here

interface RenderSettings {
  modHidden: boolean;
}

const initialState: RenderSettings = {
  modHidden: false,
};

const renderSettingsSlice = createSlice({
  name: "renderSettings",
  initialState,
  reducers: {
    modHiddenToggled(state: RenderSettings) {
      state.modHidden = !state.modHidden;
    },
    modHiddenTurnedOn(state: RenderSettings) {
      state.modHidden = true;
    },
    modHiddenTurnedOff(state: RenderSettings) {
      state.modHidden = false;
    },
  },
});

export const { modHiddenToggled, modHiddenTurnedOff, modHiddenTurnedOn } = renderSettingsSlice.actions;
export default renderSettingsSlice.reducer;
