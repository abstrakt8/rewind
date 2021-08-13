import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";

interface GameClockState {
  playing: boolean;
  playbackRate: number;
}

const initialState: GameClockState = {
  playing: false,
  playbackRate: 1.0,
};

const gameClockSlice = createSlice({
  name: "gameClock",
  initialState,
  reducers: {
    gameClockPaused(state) {
      state.playing = false;
    },
    gameClockStarted(state) {
      state.playing = true;
    },
    gameClockPlaybackRateChanged(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
  },
});

export const { gameClockStarted, gameClockPaused, gameClockPlaybackRateChanged } = gameClockSlice.actions;

// It's better to dispatch the "true" action so that everything can be handled
// case by case without looking up the state (well, except for here).
export const gameClockToggled = (dispatch: AppDispatch, getState: () => RootState) => {
  const isPlaying = getState().gameClock.playing;
  if (isPlaying) {
    dispatch(gameClockPaused());
  } else {
    dispatch(gameClockStarted());
  }
};

// TODO: Playback rate increase, decrease ... ?

export default gameClockSlice.reducer;
