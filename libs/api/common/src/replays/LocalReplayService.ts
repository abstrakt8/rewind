import { Inject, Injectable, Logger } from "@nestjs/common";
import { join } from "path";
import { read as readOsr } from "node-osr";
import { OSU_FOLDER } from "../constants";
import { splitByFirstOccurrence } from "../utils/names";

const REPLAY_NAME_SEPARATOR = ":";

@Injectable()
export class LocalReplayService {
  private logger = new Logger(LocalReplayService.name);

  constructor(@Inject(OSU_FOLDER) private osuDirectory: string) {}

  exportedPath(fileName: string) {
    return join(this.osuDirectory, "Replays", fileName);
  }

  internalPath(fileName: string) {
    return join(this.osuDirectory, "Data", "r", fileName);
  }

  /**
   * osu!/Replays
   */
  async osuExportedReplay(fileName: string) {
    return await readOsr(this.exportedPath(fileName));
  }

  /**
   * osu!/Data/r
   */
  async osuInternalReplay(fileName: string) {
    return await readOsr(this.internalPath(fileName));
  }

  /**
   * Found in the local file system
   */
  async localReplay(absoluteFilePath: string) {
    return await readOsr(absoluteFilePath);
  }

  async decodeReplay(name: string) {
    const [nameSpace, id] = splitByFirstOccurrence(name, REPLAY_NAME_SEPARATOR);
    switch (nameSpace) {
      case "exported":
        return this.osuExportedReplay(id);
      case "internal":
        return this.osuInternalReplay(id);
      case "local":
        return this.localReplay(id);
      case "api":
      // Maybe?
    }
    return Promise.resolve(undefined);
  }
}
