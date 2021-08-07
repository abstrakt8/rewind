import * as chokidar from "chokidar";
import { basename, join } from "path";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { read as osrRead } from "node-osr";
import { Injectable, Logger } from "@nestjs/common";
import { ReplayReadEvent, ReplayWatchEvents } from "../events/Events";

@Injectable()
export class ReplayWatcher {
  // Can be used for osu!/Data/r/ and osu!/Replays
  private logger = new Logger("ReplayWatcher");

  constructor(private eventEmitter: EventEmitter2) {}

  watchForReplays(replaysFolder: string): ReplayWatcher {
    // ignoreInitial must be true otherwise addDir will be triggered for every folder initially.
    const globPattern = join(replaysFolder);
    this.logger.log(`Watching for replays (.osr) in folder: ${replaysFolder} with pattern: ${globPattern}`);
    const watcher = chokidar.watch(globPattern, {
      ignoreInitial: true,
      persistent: true,
      depth: 0, // if somehow osu! is trolling, this will prevent it
    });
    watcher.on("ready", () => {
      this.eventEmitter.emit(ReplayWatchEvents.Ready);
    });
    watcher.on("add", (path) => {
      if (!path.endsWith(".osr")) {
        return;
      }
      Logger.log(`Detected path: ${path}`);
      osrRead(path, (err, replay) => {
        const event: ReplayReadEvent = { payload: { replay, path, filename: basename(path) } };
        this.eventEmitter.emit(ReplayWatchEvents.ReplayRead, event);
      });
    });
    return this;
  }
}
