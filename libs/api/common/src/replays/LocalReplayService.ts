import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ReplayReadEvent, ReplayWatchEvents } from "../events/Events";
import { join } from "path";
import { UserConfigService } from "../config/UserConfigService";
import { read as readOsr } from "node-osr";
import { OSU_FOLDER } from "../constants";

@Injectable()
export class LocalReplayService {
  private logger = new Logger("LocalReplayService");

  constructor(private userConfigService: UserConfigService, @Inject(OSU_FOLDER) private osuDirectory: string) {}

  exportedPath(fileName?: string) {
    return join(this.osuDirectory, "Replays", fileName);
  }

  internalPath(fileName?: string) {
    return join(this.osuDirectory, "Data", "r", fileName);
  }

  async exportedReplay(fileName: string) {
    return await readOsr(this.exportedPath(fileName));
  }

  async internalReplay(fileName: string) {
    return await readOsr(this.internalPath(fileName));
  }

  @OnEvent(ReplayWatchEvents.ReplayRead)
  onReplayRead(event: ReplayReadEvent) {
    const { replay, filename } = event.payload;
    this.logger.log(`Replay with name '${filename}' detected -> going to broadcast.`);

    // TODO: Maybe emit ReplayAdded and then the WebSocket will broadcast it to everybody
  }
}
