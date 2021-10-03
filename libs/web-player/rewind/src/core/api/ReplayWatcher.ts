import { inject, injectable } from "inversify";
import { Subject } from "rxjs";
import { TYPES } from "../../types/types";
import { ScenarioManager } from "../../apps/analysis/manager/ScenarioManager";
import { io, Socket } from "socket.io-client";

// interface Payload {
//   replay: { filename: string };
//   beatmapMetaData: { md5Hash: string };
// }
type Payload = {
  blueprintId: string;
  replayId: string;
};

function createWebSocketConnection(url: string) {
  const socket = io(url);
  socket.on("connect", () => {
    console.log("Connected to WebSocket");
  });
  return socket;
}

@injectable()
export class ReplayWatcher {
  public readonly newReplays$: Subject<string>;
  private socket: Socket;

  constructor(@inject(TYPES.WS_URL) private readonly wsUrl: string, private readonly scenarioManager: ScenarioManager) {
    this.socket = createWebSocketConnection(wsUrl);
    this.newReplays$ = new Subject<string>();
  }

  replayAddedHandler(replay: { filename: string }, beatmapMetaData: { md5Hash: string }) {
    const { md5Hash } = beatmapMetaData;

    console.log(`WebSocket: Replay added: ${replay.filename}, ${md5Hash}`);

    const replayId = "exported:" + replay.filename;
    this.newReplays$.next(replayId);
  }

  startWatching() {
    console.log("Started replay watching subscription");

    this.socket.on("replayAdded", this.replayAddedHandler.bind(this));

    this.newReplays$.subscribe((replayId) => {
      // TODO: if settings also true
      this.scenarioManager.loadReplay(replayId);
    });
  }
}
