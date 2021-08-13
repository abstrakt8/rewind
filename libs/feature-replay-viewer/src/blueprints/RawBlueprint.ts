import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

interface RawBlueprint {
  id: string;
  rawData: string;
}

const blueprintAdapter = createEntityAdapter<RawBlueprint>({
  selectId: (blueprint) => blueprint.id,
});

const rawBlueprintSlice = createSlice({
  name: "raw-blueprint",
  initialState: blueprintAdapter.getInitialState(),
  reducers: {
    addRawBlueprint: blueprintAdapter.addOne,
  },
});

export const { addRawBlueprint } = rawBlueprintSlice.actions;
export default rawBlueprintSlice.reducer;
