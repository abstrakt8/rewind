import { changeScenario } from "./saga";
import { scenarioChangeRequested } from "./actions";

test("ChangeScenario", () => {
  const it = changeScenario(scenarioChangeRequested({ blueprintId: "cdc32029d4c95b9df6f3793613668aad", replayId: "" }));
  console.log(it.next().value);
  console.log(it.next().value);
});
