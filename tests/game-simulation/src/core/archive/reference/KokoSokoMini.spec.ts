// abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.json

import { testBlueprintPath, testReferencePath, testReplayPath } from "../../../util";
import { compareTimeMachineWithReference } from "../../../reference";

const blueprintFile = testBlueprintPath(
  "1302792 Smiledk - Koko Soko (AKIBA KOUBOU Eurobeat Remix)/Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) ([ Couch ] Mini) [Couch Mini2a].osu",
);
const replayFile = testReplayPath(
  "abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.osr",
);
// osu!stable
const referenceFile = testReferencePath(
  "abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.json",
);

// TODO: Delete or refactor this test
test.skip("Koko Soko Mini", async () => {
  // const reference = readStableReferenceJson(referenceFile);
  // const timeMachine = createTestTimeMachine(blueprintFile, replayFile);
  // We only check for misses
  await compareTimeMachineWithReference(blueprintFile, replayFile, referenceFile, { countsToCheck: [3] });
});
