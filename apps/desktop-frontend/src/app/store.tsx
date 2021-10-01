import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import localBlueprintInfoReducer from "./blueprints/LocalBlueprintInfo";
import theaterReducer from "./theater/slice";
import backendReducer from "./backend/slice";
import settingsReducer from "./settings/slice";
import { createRewindRootSaga } from "./RootSaga";
import { createHashHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { rewindDesktopApi } from "./backend/api";
import { setupListeners } from "@reduxjs/toolkit/query";

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
// const hibanaId = "671199 DECO_27 - HIBANA feat Hatsune Miku/DECO27 - HIBANA feat. Hatsune Miku (Pho) [Lock On].osu";
// const akatsukiId = "351280 HoneyWorks - Akatsuki Zukuyo/HoneyWorks - Akatsuki Zukuyo ([C u r i]) [Taeyang's
// Extra].osu"; const akatsukiReplayId = "RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";
// "150945 Knife Party - Centipede/Knife Party - Centipede (Sugoi-_-Desu) [This isn't a map, just a simple
// visualisation].osu"; "933630 Aether Realm - The Sun, The Moon, The Star/Aether Realm - The Sun, The Moon, The Star
// (ItsWinter) [Mourning Those Things I've Long Left Behind].osu";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";

const hibanaId = "cdc32029d4c95b9df6f3793613668aad";
const paranoidLostId = "e8926f1d19663e46e469dd0175eae6d9";

const hibanaReplayId = "hallowatcher - DECO27 - HIBANA feat. Hatsune Miku [Lock On] (2020-02-09) Osu.osr";
const centipedeId = "f8a383c1de40613c61aa86f0fcec60f2";

const sunMoonId = "1ff6975c142ac59e4731cb09f5d46bcc";
const kokoSokoId = "bad6319dcbc8773c17dbf67a8e5ececa";
const kokoSokoReplayId =
  "- abstrakt - Smile.dk - Koko Soko (AKIBA KOUBOU Eurobeat Remix) [Couch Mini2a] (2021-04-09) Osu.osr";

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

// const chosenBlueprintId = paranoidLostId;
// const chosenReplayId = undefined;

// const chosenBlueprintId = hibanaId;
// const chosenReplayId = hibanaReplayId;

// const chosenBlueprintId = centipedeId;
// const chosenReplayId = undefined;

// const chosenBlueprintId = sunMoonId;
// const chosenReplayId = sunMoonReplayId;

const chosenBlueprintId = kokoSokoId;
const chosenReplayId = kokoSokoReplayId;

// const chosenBlueprintId = akatsukiId;
// const chosenReplayId = akatsukiReplayId;

// const chosenBlueprintId = akatsukiId;
// const chosenReplayId = undefined;

const chosenSkinId = aristaSkinId;
// const chosenSkinId = kasugaMirai;
// const chosenSkinId = rafisSkinId;

const ALL_SKINS: Record<string, LSkin> = {
  [aristaSkinId]: {
    id: aristaSkinId,
    name: "Aristia",
  },
  [rafisSkinId]: { id: rafisSkinId, name: "Rafis 2018 HDDT" },
  // [millhioreLiteId]: { id: millhioreLiteId, name: "Millhiore Lite" },
  [kasugaMirai]: { id: kasugaMirai, name: "Kasuga Mirai" },
};

export const history = createHashHistory();

const reducer = {
  router: connectRouter(history),
  localBlueprintInfo: localBlueprintInfoReducer,
  theater: theaterReducer,
  backend: backendReducer,
  settings: settingsReducer,
  [rewindDesktopApi.reducerPath]: rewindDesktopApi.reducer,
};

const sagaMiddleware = createSagaMiddleware();

const isDev = process.env.NODE_ENV !== "production" && false;
const preloadedState = isDev
  ? {
      theater: {
        chosenBlueprintId,
        chosenReplayId,
      },
    }
  : {};
const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware).concat(routerMiddleware(history)).concat(rewindDesktopApi.middleware),
  preloadedState,
});

setupListeners(store.dispatch);

sagaMiddleware.run(createRewindRootSaga());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
