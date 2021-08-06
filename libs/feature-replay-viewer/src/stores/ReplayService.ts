import { OsuExpressReplayManager, OsuReplay } from "../managers/ReplayManager";

export class ReplayService {
  constructor() {}
  async loadReplay(id: string): Promise<OsuReplay> {
    return new OsuExpressReplayManager("http://localhost:7271").loadReplay(id);
  }
}
