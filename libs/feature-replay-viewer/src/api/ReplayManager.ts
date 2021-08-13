import axios from "axios";
import { modsFromBitmask, parseReplayFramesFromRaw, RawReplayData } from "@rewind/osu/core";
import { OsuReplay } from "../replays/slice";

// Just happened to be RawReplayData ;)
type OsuExpressReplay = RawReplayData;

export interface ReplayManager {
  loadReplay(replayId: string): Promise<OsuReplay>;
}

// Specifically with osu-express
export class OsuExpressReplayManager implements ReplayManager {
  osuExpressUrl: string;

  constructor(osuExpressUrl: string) {
    this.osuExpressUrl = osuExpressUrl;
  }

  async loadReplay(replayName: string): Promise<OsuReplay> {
    const url = [this.osuExpressUrl, "api", "replays", "exported", replayName].join("/");
    // const url = "";
    const res = (await axios
      .get(url)
      .then((value) => value.data)
      .catch((err) => {
        console.error(err);
        return null;
      })) as OsuExpressReplay;

    return {
      gameVersion: res.gameVersion,
      frames: parseReplayFramesFromRaw(res.replay_data),
      mods: modsFromBitmask(res.mods),
      md5hash: "",
      player: "",
    };
  }
}
