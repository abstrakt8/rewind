// abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.json

// import { compareTimeMachineWithReference } from "../../../../../libs/osu/core/test/utils/reference";
import { testBlueprintPath, testReferencePath, testReplayPath } from "../../../util";

const blueprintFile = testBlueprintPath(
  "840260 Gojou Mayumi - DANZEN! Futari wa PreCure Ver MaxHeart (TV Size)/Gojou Mayumi - DANZEN! Futari wa PreCure Ver. MaxHeart (TV Size) (Sotarks) [Insane].osu",
);
const replayFile = testReplayPath(
  "abstrakt - Gojou Mayumi - DANZEN! Futari wa PreCure Ver. MaxHeart (TV Size) [Insane] (2021-08-21) Osu.osr",
);
// osu!stable
const referenceFile = testReferencePath(
  "abstrakt - Gojou Mayumi - DANZEN! Futari wa PreCure Ver. MaxHeart (TV Size) [Insane] (2021-08-21) Osu.json",
);

// TODO: Delete or refactor
test.skip("DANZEN", async () => {
  // const reference = readStableReferenceJson(referenceFile);
  // const timeMachine = createTestTimeMachine(blueprintFile, replayFile);
  // We only check for misses
  // await compareTimeMachineWithReference(blueprintFile, replayFile, referenceFile, { countsToCheck: [1] });
  // 1st one: slider end miss
  // TODO: 2nd one: probably not pressing ??? otherwise massive discrepancy
  // 3rd one: like 1st one
});
