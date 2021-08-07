import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ReplayReadEvent, ReplayWatchEvents } from "../events/Events";
import { join } from "path";
import { UserConfigService } from "../config/UserConfigService";
import { read as readOsr } from "node-osr";

@Injectable()
export class LocalReplayService {
  private Logger = new Logger("LocalReplayService");

  constructor(private userConfigService: UserConfigService) {}

  exportedPath(fileName?: string) {
    const { osuDirectory } = this.userConfigService.getConfig();
    return join(osuDirectory, "Replays", fileName);
  }

  internalPath(fileName?: string) {
    const { osuDirectory } = this.userConfigService.getConfig();
    return join(osuDirectory, "Data", "r", fileName);
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
    this.Logger.log(`Replay with name '${filename}' detected -> going to broadcast.`);

    // TODO: Maybe emit ReplayAdded and then the WebSocket will broadcast it to everybody
  }
}
