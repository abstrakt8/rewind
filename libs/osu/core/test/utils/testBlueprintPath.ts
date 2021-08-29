import { join } from "path";

const rewindTestOsuDir = join(process.env.REWIND_TEST_DIR || "", "osu!");
const rewindTestReferenceDir = join(process.env.REWIND_TEST_DIR || "", "reference");

export function testBlueprintPath(fileName: string): string {
  return join(rewindTestOsuDir, "Songs", fileName);
}

export function testReplayPath(fileName: string): string {
  return join(rewindTestOsuDir, "Replays", fileName);
}

export function testReferencePath(fileName: string): string {
  return join(rewindTestReferenceDir, fileName);
}

// TODO: Maybe move those to the respective test suites

export const TEST_MAPS = {
  ONE_SLIDER: testBlueprintPath("967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Slider 1].osu"),
  SLIDER_WITH_ONE_REPEAT: testBlueprintPath(
    "967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Slider (Repeat = 1)].osu",
  ),
  SHORT_KICK_SLIDER: testBlueprintPath(
    "967347 Perfume - Daijobanai/Perfume - Daijobanai (eiri-) [Short kick slider].osu",
  ),
  VIOLET_PERFUME: testBlueprintPath(
    "1010865 SHK - Violet Perfume [no video]/SHK - Violet Perfume (ktgster) [Insane].osu",
  ),
  GERA_GERA: testBlueprintPath(
    "1001507 ZUTOMAYO - Kan Saete Kuyashiiwa/ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu",
  ),
  SUN_MOON_STAR: testBlueprintPath(
    "933630 Aether Realm - The Sun, The Moon, The Star/Aether Realm - The Sun, The Moon, The Star (ItsWinter) [Mourning Those Things I've Long Left Behind].osu",
  ),
  TOP_RANKER: testBlueprintPath(
    "1357624 sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix)/sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix) (Nathan) [Senseabel's Extra].osu",
  ),
};

export const TEST_REPLAYS = {
  SUN_MOON_STAR_VARVALIAN: testReplayPath(
    "Varvalian - Aether Realm - The Sun, The Moon, The Star [Mourning Those Things I've Long Left Behind] (2019-05-15) Osu.osr",
  ),
  ABSTRAKT_TOP_RANKER: testReplayPath(
    "abstrakt - sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix) [Senseabel's Extra] (2021-08-08) Osu.osr",
  ),
  KOKO_SOKO_MINI_ABSTRAKT: testReplayPath(
    "abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.osr",
  ),
};
