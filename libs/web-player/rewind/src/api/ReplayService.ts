import axios from "axios";
import { modsFromBitmask, parseReplayFramesFromRaw, RawReplayData } from "@rewind/osu/core";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { OsuReplay } from "../model/OsuReplay";

/**
 * Currently this service retrieves the raw replay from the backend.
 *
 * In the future it is planned that the client retrieves the `.osr` file directly:
 * * Less data transferred since `.osr` is compressed
 * * Relieves the backend since it does not have to decode the `.osr` file
 */
@injectable()
export class ReplayService {
  constructor(@inject(TYPES.API_URL) private apiUrl: string) {}

  async retrieveReplay(replayId: string): Promise<OsuReplay> {
    const url = [this.apiUrl, "api", "replays", encodeURIComponent(replayId)].join("/");
    console.log(`Retrieving replay=${replayId} from ${url}`);

    const res = (await axios.get(url)).data as RawReplayData;

    // TODO: Emit ...

    return {
      gameVersion: res.gameVersion,
      frames: parseReplayFramesFromRaw(res.replay_data),
      mods: modsFromBitmask(res.mods),
      md5hash: res.replayMD5,
      player: res.playerName,
    };
  }
}
