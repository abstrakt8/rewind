// Holds the replays
import { injectable } from "inversify";
import { OsuReplay } from "../../../model/OsuReplay";

@injectable()
export class ReplayManager {
  replay: OsuReplay | null = null;

  setMainReplay(replay: OsuReplay | null) {
    this.replay = replay;
  }
}
