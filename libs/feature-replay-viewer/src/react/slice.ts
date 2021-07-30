import { createSlice } from "@reduxjs/toolkit";

interface Scenario {
  id: string;
  beatmapId: string;
  replayId?: string;
}

const initialState: Record<string, Scenario> = {};

const scenario = createSlice({
  name: "scenario",
  initialState,
  reducers: {},
});
