import { AnalysisAppPage } from "../../../../../libs/feature-replay-viewer/src/AnalysisAppPage";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "exported:RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";

const chosenBlueprintId = akatsukiId;
const chosenReplayId = akatsukiReplayId;

export function App() {
  return (
    <AnalysisAppPage scenario={{ replayId: chosenReplayId, blueprintId: chosenBlueprintId, otherReplayIds: [] }} />
  );
}

export default App;
