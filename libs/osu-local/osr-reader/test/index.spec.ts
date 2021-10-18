import { OsrReplay, readSync } from "../src";
// TODO: Maybe make a common module
import { TEST_REPLAYS } from "../../../osu/core/test/utils/testBlueprintPath";
import { ReplayModBit } from "@rewind/osu/core";

test("Large file", () => {
  const s = readSync(TEST_REPLAYS.SUN_MOON_STAR_VARVALIAN);
  console.log(s.replay_data.length);
});

test("To v2", () => {
  const test = "abstrakt - Kana Nishino - Darling [Darling] (2021-09-05) Osu.osr";
  const r = readSync(test) as OsrReplay;

  r.mods |= ReplayModBit.SCORE_V2;
  r.misses = 2;
  r.number_50s = 1;
  r.number_100s = 5;
  r.number_300s = 218;
  r.gekis = 46;
  r.katus = 5;
  r.score = 756098;

  (r as any).writeSync("TestV2.osr");
});
