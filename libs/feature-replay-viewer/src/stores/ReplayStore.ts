import { makeAutoObservable } from "mobx";
import { OsuExpressReplayManager, OsuReplay } from "../managers/ReplayManager";

export class ReplayStore {
  constructor() {
    makeAutoObservable(this);
  }
  async loadReplay(id: string): Promise<OsuReplay> {
    return new OsuExpressReplayManager("http://localhost:7271").loadReplay(id);
  }
}
