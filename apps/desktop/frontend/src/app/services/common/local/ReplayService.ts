import { modsFromBitmask, parseReplayFramesFromRaw } from "@osujs/core";
import { injectable } from "inversify";
import { OsuReplay } from "../../../model/OsuReplay";
import { OsuFolderService } from "./OsuFolderService";
import { join } from "path";
import { ipcRenderer } from "electron";
import { REPLAY_SOURCES } from "./ReplaySources";

@injectable()
export class ReplayService {
  constructor(private readonly osuFolderService: OsuFolderService) {}

  determinePath(file: string, source: REPLAY_SOURCES) {
    switch (source) {
      case "FILE":
        return file;
      case "OSU_REPLAYS_FOLDER":
        return join(this.osuFolderService.getOsuFolder(), file);
    }
  }

  async retrieveReplay(replayId: string, source: REPLAY_SOURCES = "FILE"): Promise<OsuReplay> {
    const filePath = this.determinePath(replayId, source);
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
