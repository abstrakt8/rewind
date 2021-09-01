import { readSync } from "../src";
// TODO: Maybe make a common module
import { TEST_REPLAYS } from "../../../osu/core/test/utils/testBlueprintPath";

test("Large file", () => {
  const s = readSync(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);
  console.log(s.replay_data.length);
});
