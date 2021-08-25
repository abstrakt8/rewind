import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TheaterState {
  chosenBlueprintId: string | null;
  chosenReplayId: string | null;
}

const initialState: TheaterState = {
  chosenBlueprintId: null,
  chosenReplayId: null,
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
  },
});

export const { theaterStageChangeRequested } = theaterSlice.actions;
export default theaterSlice.reducer;
