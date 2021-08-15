import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultViewSettings, ViewSettings } from "../game/ViewSettings";
import { AppDispatch, RootState } from "../store";

type State = "LOADING" | "DONE" | "ERROR";

// This slice is just

interface Theater {
  view: ViewSettings;
  state: State;
  isPlaying: boolean;
  playbackRate: number;
}

const initialState: Theater = {
  state: "LOADING",
  view: defaultViewSettings(),
  isPlaying: false,
  playbackRate: 1.0,
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

export const modHiddenToggleRequested = (dispatch: AppDispatch, getState: () => RootState) => {
  const view = getState().theater.view;
  dispatch(theaterViewChanged({ ...view, modHidden: !view.modHidden }));
};

export const { theaterViewChanged } = theaterSlice.actions;
export default theaterSlice.reducer;
