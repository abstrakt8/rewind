// Holds the replays
import { injectable } from "inversify";
import { OsuReplay } from "../../model/OsuReplay";
import { BehaviorSubject } from "rxjs";

@injectable()
export class ReplayManager {
  // mainReplay: OsuReplay | null = null;
  mainReplay$: BehaviorSubject<OsuReplay | null>;

  constructor() {
    this.mainReplay$ = new BehaviorSubject<OsuReplay | null>(null);
  }

  getMainReplay() {
    return this.mainReplay$.value;
  }

  setMainReplay(replay: OsuReplay | null) {
    this.mainReplay$.next(replay);
  }
}
