import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultViewSettings, ViewSettings } from "../game/ViewSettings";

type State = "LOADING" | "DONE" | "ERROR";

interface Theater {
  view: ViewSettings;
  state: State;
}

const initialState: Theater = {
  state: "LOADING",
  view: defaultViewSettings(),
};

const theaterSlice = createSlice({
  name: "theater",
  initialState,
  reducers: {
    theaterViewChanged(state, action: PayloadAction<ViewSettings>) {
      state.view = action.payload;
    },
  },
});

export const { theaterViewChanged } = theaterSlice.actions;
export default theaterSlice.reducer;
