import { commonStats, createTestTimeMachine, TEST_MAPS, TEST_REPLAYS } from "../util.spec";
import { retrieveEvents } from "../../src";

test("abstrakt - Top Ranker", () => {
  // md5 3be542cdcfbad11d922f05f1a7df8463
  // This replay is a bit bugged:
  // t=229528
  // t=229569 -> 41ms difference (almost two frames lost)
  // There is a slider checkpoint ~229530ms which was not handled. ok!!!
  const { timeMachine, beatmap, replay } = createTestTimeMachine(
    TEST_MAPS.TOP_RANKER,
    TEST_REPLAYS.ABSTRAKT_TOP_RANKER,
  );

  const gameState = timeMachine.gameStateAt(1e9);

  commonStats(replay.frames);
  // There also slider ticks and so on
  expect(gameState.judgedObjects.length).toBeGreaterThan(1653);

  const events = retrieveEvents(gameState, beatmap.hitObjects);
  expect(events.length).toBeGreaterThan(1653);
});
