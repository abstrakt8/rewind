import { Theater } from "@rewind/feature-replay-viewer";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";

const chosenBlueprintId = akatsukiId;
const chosenReplayId = akatsukiReplayId;

export function WebTestApp() {
  return <Theater chosenBlueprintId={chosenBlueprintId} chosenReplayId={chosenReplayId} />;
}
