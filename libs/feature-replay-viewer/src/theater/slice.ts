import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PlaybarSettings {
  show50s: boolean;
  show100s: boolean;
  showMisses: boolean;
  showSliderBreaks: boolean;
}

interface TheaterState {
  chosenBlueprintId: string | null;
  chosenReplayId: string | null;
  playbarSettings: PlaybarSettings;
}

const initialState: TheaterState = {
  chosenBlueprintId: null,
  chosenReplayId: null,
  playbarSettings: {
    show50s: false,
    show100s: false,
    showMisses: true,
    showSliderBreaks: true,
  },
};

const theaterSlice = createSlice({
  name: "theater",
  initialState,
  reducers: {
    theaterStageChangeRequested(state, action: PayloadAction<{ replayId: string | null; blueprintId: string }>) {
      const { replayId, blueprintId } = action.payload;
      state.chosenBlueprintId = blueprintId;
      state.chosenReplayId = replayId;
    },
    playbarSettingsChanged(state, action: PayloadAction<PlaybarSettings>) {
      state.playbarSettings = action.payload;
    },
  },
});

export const { theaterStageChangeRequested, playbarSettingsChanged } = theaterSlice.actions;
export default theaterSlice.reducer;
