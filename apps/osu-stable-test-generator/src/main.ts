import * as WebSocket from "ws";
import { GosuMemoryAPI, OsuMemoryStatus } from "@rewind/osu-local/gosumemory";

const wsUrl = "ws://localhost:24050/ws";

const ws = new WebSocket(wsUrl);

export interface OsuStableGameState {
  time: number;
  counts: number[];
  hitOffsets: number[]; // hitError
}

function arrayEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

//
export const currentIsInteresting = (previous: OsuStableGameState, current: OsuStableGameState): boolean => {
  // const hitOffsetsDifferent = !arrayEqual(previous.hitOffsets, current.hitOffsets) && false; // We don't want them
  const countsDifferent = !arrayEqual(previous.counts, current.counts);
  return countsDifferent;
  // return hitOffsetsDifferent || countsDifferent;
};

interface MyData extends OsuStableGameState {
  state: OsuMemoryStatus;
  beatmapMd5: string;
}

const defaultData: MyData = {
  beatmapMd5: "",
  state: OsuMemoryStatus.Unknown,
  time: -1,
  counts: [],
  hitOffsets: [],
};

interface DataToStore {
  beatmapMd5: string;
  frames: { time: number; counts: number[] }[];
  hitOffsets: number[];
}

function persist(file: string, data: DataToStore) {}

function filterInteresting(gameStates: OsuStableGameState[]) {
  // First one always interesting
  if (gameStates.length === 0) {
    return [];
  }
  const res = [gameStates[0]];
  for (let i = 1; i < gameStates.length; i++) {
    if (currentIsInteresting(res[res.length - 1], gameStates[i])) {
      res.push(gameStates[i]);
    }
  }
  return res;
}

class TestGenerator {
  previousState = OsuMemoryStatus.Unknown;
  gameStates: OsuStableGameState[] = [];

  processPlaying(data: MyData) {
    if (this.previousState !== OsuMemoryStatus.Playing) {
      console.log(`Started with new beatmap ${data.beatmapMd5}`);
      this.gameStates = [data];
    } else {
      this.gameStates.push(data);
    }
  }

  processResultScreen(data: MyData) {
    // We only want to store some data if the previous state was actually playing and not something like SongSelect
    if (this.previousState === OsuMemoryStatus.Playing && this.gameStates.length > 0) {
      const interesting = filterInteresting(this.gameStates);
      console.log("Going to store ...", interesting.length);
      if (interesting.length === 0) {
        return;
      }

      const lastState = interesting[interesting.length - 1];
      const frames = interesting.map((a) => ({ time: a.time, counts: a.counts }));
      const store: DataToStore = {
        beatmapMd5: data.beatmapMd5,
        frames: frames,
        hitOffsets: lastState.hitOffsets,
      };

      console.log(JSON.stringify(store));
    }
  }

  processData(data: MyData) {
    switch (data.state) {
      case OsuMemoryStatus.ResultsScreen:
        this.processResultScreen(data);
        break;
      case OsuMemoryStatus.Playing:
        this.processPlaying(data);
        break;
    }
    this.previousState = data.state;
  }
}

const Verdicts = ["300", "100", "50", "0"] as const;
type Verdict = typeof Verdicts[number];

function extractData(data: GosuMemoryAPI): MyData {
  const { menu, gameplay } = data;
  return {
    state: menu.state,
    time: menu.bm.time.current,
    counts: Verdicts.map((s) => gameplay.hits[s]),
    hitOffsets: gameplay.hits.hitErrorArray ?? [],
    beatmapMd5: menu.bm.md5,
  };
}

const testGenerator = new TestGenerator();

/**
 * If going to results screen -> store as a json
 *
 * md5Hash_timestamp.json
 *
 * @param event
 */
ws.onmessage = (event) => {
  if (typeof event.data !== "string") {
    return;
  }
  const data = JSON.parse(event.data) as GosuMemoryAPI;
  testGenerator.processData(extractData(data));
};
