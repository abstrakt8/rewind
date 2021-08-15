import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

interface LocalBlueprintInfo {
  id: string;
  title: string;
  // lastPlayed: ... ? ->
}

const adapter = createEntityAdapter<LocalBlueprintInfo>({
  selectId: (blueprint) => blueprint.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

const blueprintSlice = createSlice({
  name: "blueprints",
  initialState: adapter.getInitialState(),
  reducers: {},
});

export const {} = blueprintSlice.actions;
export default blueprintSlice.reducer;
