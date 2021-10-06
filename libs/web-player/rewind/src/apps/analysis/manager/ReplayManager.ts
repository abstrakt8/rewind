// Holds the replays
import { injectable } from "inversify";
import { OsuReplay } from "../../../model/OsuReplay";

@injectable()
export class ReplayManager {
  mainReplay: OsuReplay | null = null;

  getMainReplay() {
    return this.mainReplay;
  }

  setMainReplay(replay: OsuReplay | null) {
    this.mainReplay = replay;
  }
}
