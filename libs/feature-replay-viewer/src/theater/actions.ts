import { createAction } from "@reduxjs/toolkit";

type Payload = {
  blueprintId: string;
  replayId: string;
};
export const scenarioChangeRequested = createAction<Payload>("SCENARIO_CHANGE_REQUESTED");
