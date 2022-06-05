import { injectable } from "inversify";
import { Subject } from "rxjs";
import * as chokidar from "chokidar";
import { OsuFolderService } from "./OsuFolderService";

@injectable()
export class ReplayWatcher {
  public readonly newReplays$: Subject<string>;
  private watcher?: chokidar.FSWatcher;

  // TODO:
  private readonly replaysFolder: string = "D:\\osu!\\Replays";

  constructor(private readonly osuFolderService: OsuFolderService) {
    this.newReplays$ = new Subject<string>();
  }

  public startWatching() {
    this.osuFolderService.replaysFolder$.subscribe(this.onNewReplayFolder.bind(this));
  }

  // Unsubscribes from the old replay folder and starts listening on the new folder that was given
  // TODO: In the future we might want to watch on a list of folders and not just the osu! folder
  private onNewReplayFolder(folder: string) {
    // For now, we just use .close()
    // We could make it cleaner by using .unwatch() and adding new files to watch
    if (this.watcher) {
      void this.watcher.close();
    }

    const globPattern = folder;
    console.log(`Watching for replays (.osr) in folder: ${this.replaysFolder} with pattern: ${globPattern}`);
    this.watcher = chokidar.watch(globPattern, {
      // ignoreInitial must be true otherwise addDir will be triggered for every folder initially.
      ignoreInitial: true,
      persistent: true,
      depth: 0, // if somehow osu! is trolling, this will prevent it
    });
    this.watcher.on("ready", () => {
      console.log("");
    });
    this.watcher.on("add", (path) => {
      if (!path.endsWith(".osr")) {
        return;
      }
      console.log(`Detected new file at: ${path}`);
      this.newReplays$.next(path);
    });

  }

}
