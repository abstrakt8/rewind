import { parser, std_diff } from "ojsama";
import { readFile } from "fs/promises";
import { TEST_MAPS } from "../util";

test("Performance of ojsama", async () => {
  const data = await readFile(TEST_MAPS.SUN_MOON_STAR, "utf-8");
  const p = new parser();
  p.feed(data);

  const map = p.map;
  const mods = 0;

  const d = new std_diff().calc({ map, mods });
  // console.log(d.objects.map((d) => d.strains[0] + d.strains[1]));
  // Around 150ms: pretty fast for 6000 hitobjects
});
