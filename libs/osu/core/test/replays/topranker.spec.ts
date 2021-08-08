import { createTestTimeMachine, TEST_MAPS, TEST_REPLAYS } from "../util.spec";

test("abstrakt - Top Ranker", () => {
  const { timeMachine } = createTestTimeMachine(TEST_MAPS.TOP_RANKER, TEST_REPLAYS.ABSTRAKT_TOP_RANKER);

  const gameState = timeMachine.gameStateAt(1e9);

  // There also slider ticks and so on
  expect(gameState.judgedObjects.length).toBeGreaterThan(1653);
});
