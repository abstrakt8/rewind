import { modsFromBitmask, parseReplayFramesFromRaw } from "@osujs/core";
import { injectable } from "inversify";
import { OsuReplay } from "../../../model/OsuReplay";
import { ipcRenderer } from "electron";

export type REPLAY_SOURCES = "OSU_API" | "FILE";

@injectable()
export class ReplayService {
  async retrieveReplay(replayId: string, source: REPLAY_SOURCES = "FILE"): Promise<OsuReplay> {
    const filePath = replayId;
    // const res = await readOsr(filePath);
    // Currently using readOsr is bugged, so we need to use it from the main process
    const res = await ipcRenderer.invoke("readOsr", filePath);
    return {
      gameVersion: res.gameVersion,
      frames: parseReplayFramesFromRaw(res.replay_data),
      mods: modsFromBitmask(res.mods),
      md5hash: res.replayMD5,
      beatmapMd5: res.beatmapMD5,
      player: res.playerName,
    };
  }
}
