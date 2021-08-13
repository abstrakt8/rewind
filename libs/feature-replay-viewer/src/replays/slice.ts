import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { OsuClassicMod, ReplayFrame } from "@rewind/osu/core";

// TODO: Rename this to replay or something
export type OsuReplay = {
  md5hash: string;
  gameVersion: number;
  mods: OsuClassicMod[];
  player: string; // Could be useful to draw
  frames: ReplayFrame[];
};

const adapter = createEntityAdapter<OsuReplay>({
  selectId: (model) => model.md5hash,
});

const replaySlice = createSlice({
  name: "replay",
  initialState: adapter.getInitialState(),
  reducers: {
    replayAdded: adapter.addOne,
  },
});

export const { replayAdded } = replaySlice.actions;
export default replaySlice.reducer;
