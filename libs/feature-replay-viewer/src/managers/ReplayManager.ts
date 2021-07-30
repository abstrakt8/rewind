import axios from "axios";
import { fromRawToReplay, RawReplayData } from "@rewind/osu/core";
import { ReplayFrame } from "@rewind/osu/core";

export type OsuReplay = {
  gameVersion: number;
  mods: number;
  frames: ReplayFrame[];
};

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
      frames: fromRawToReplay(res.replay_data),
      mods: res.mods,
    };
  }
}
