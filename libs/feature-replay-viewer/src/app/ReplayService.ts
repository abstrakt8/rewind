import axios from "axios";
import { modsFromBitmask, parseReplayFramesFromRaw, RawReplayData } from "@rewind/osu/core";
import { OsuReplay } from "../replays/slice";

export class ReplayService {
  // retrieve and parse
  constructor(private apiUrl: string) {}

  async retrieveReplay(replayId: string): Promise<OsuReplay> {
    const url = [this.apiUrl, "api", "replays", "exported", replayId].join("/");
    // const url = "";
    const res = (await axios
      .get(url)
      .then((value) => value.data)
      .catch((err) => {
        console.error(err);
        return null;
      })) as RawReplayData;

    return {
      gameVersion: res.gameVersion,
      frames: parseReplayFramesFromRaw(res.replay_data),
      mods: modsFromBitmask(res.mods),
      md5hash: res.replayMD5,
      player: res.playerName,
    };
  }
}
