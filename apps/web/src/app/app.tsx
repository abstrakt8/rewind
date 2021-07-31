import { FeatureReplayViewer } from "@rewind/feature-replay-viewer";
import { OsuExpressProvider } from "../../../../libs/feature-replay-viewer/src/contexts/OsuExpressContext";
import { useMobXContext } from "../../../../libs/feature-replay-viewer/src/contexts/MobXContext";
import { useEffect } from "react";

type Replay = {
  id: string;
  name: string;
};

type Beatmap = {
  id: string;
  name: string;
  replays: string[];
};
type LSkin = {
  id: string;
  name: string;
};

const akatsukiId = "351280 HoneyWorks - Akatsuki Zukuyo/HoneyWorks - Akatsuki Zukuyo ([C u r i]) [Taeyang's Extra].osu";
const akatsukiReplayId = "RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";
const centipedeId =
  "150945 Knife Party - Centipede/Knife Party - Centipede (Sugoi-_-Desu) [This isn't a map, just a simple visualisation].osu";
const sunMoonId =
  "933630 Aether Realm - The Sun, The Moon, The Star/Aether Realm - The Sun, The Moon, The Star (ItsWinter) [Mourning Those Things I've Long Left Behind].osu";
const sunMoonReplayId =
  "Varvalian - Aether Realm - The Sun, The Moon, The Star [Mourning Those Things I've Long Left Behind] (2019-05-15) Osu.osr";

const ALL_BEATMAPS: Record<string, Beatmap> = {
  [akatsukiId]: {
    id: akatsukiId,
    name: "Akatsuki Zukuyo",
    replays: [akatsukiReplayId],
  },
  [centipedeId]: {
    id: centipedeId,
    name: "Centipede",
    replays: [],
  },
  [sunMoonId]: {
    id: sunMoonId,
    name: "The Sun, The Moon, The Star",
    replays: [sunMoonReplayId],
  },
};
const ALL_REPLAYS: Record<string, Replay> = {
  [akatsukiReplayId]: {
    id: akatsukiReplayId,
    name: "RyuK +HDDT",
  },
  [sunMoonReplayId]: {
    id: sunMoonReplayId,
    name: "Varvalian",
  },
};

const aristaSkinId = "- Aristia(Edit)+trail";
const rafisSkinId = "Rafis 2018-03-26 HDDT";
const millhioreLiteId = "Millhiore Lite"; // -> buggy because we don't have default skin
const kasugaMirai = "Kasuga Mirai";

const chosenBlueprintId = sunMoonId;
const chosenReplayId = sunMoonReplayId;
// const chosenBlueprintId = centipedeId;
// const chosenReplayId = undefined;
const chosenSkinId = kasugaMirai;
// const chosenSkinId = kasugaMirai;

const ALL_SKINS: Record<string, LSkin> = {
  [aristaSkinId]: {
    id: aristaSkinId,
    name: "Aristia",
  },
  [rafisSkinId]: { id: rafisSkinId, name: "Rafis 2018 HDDT" },
  // [millhioreLiteId]: { id: millhioreLiteId, name: "Millhiore Lite" },
  [kasugaMirai]: { id: kasugaMirai, name: "Kasuga Mirai" },
};

export function App() {
  const { scenario, renderSettings } = useMobXContext();
  useEffect(() => {
    Promise.all([
      renderSettings.changeSkin(chosenSkinId),
      scenario.loadScenario(chosenBlueprintId, chosenReplayId),
    ]).then(() => {
      console.log(`Finished loading ${chosenBlueprintId} with skin ${chosenSkinId}`);
    });
  }, [scenario, chosenBlueprintId, chosenSkinId]);
  return <FeatureReplayViewer />;
}

export default App;
