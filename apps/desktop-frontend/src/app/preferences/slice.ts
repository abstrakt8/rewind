import { createSlice } from "@reduxjs/toolkit";
import { defaultViewSettings, ViewSettings } from "@rewind/feature-replay-viewer";
import { RootState } from "../store";

interface Preferences {
  view: ViewSettings;
}

const initialState: Preferences = {
  view: defaultViewSettings(),
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {},
});

export const preferencesViewSelector = (state: RootState) => state.preferences.view;

// export const {} = preferencesSlice.actions;

export default preferencesSlice.reducer;
