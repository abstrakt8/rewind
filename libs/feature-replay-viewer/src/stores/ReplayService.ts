import { OsuExpressReplayManager, OsuReplay } from "../api/ReplayManager";

// TODO: Caching
export class ReplayService {
  constructor(private readonly url: string) {}

  async loadReplay(id: string): Promise<OsuReplay> {
    return new OsuExpressReplayManager(this.url).loadReplay(id);
  }
}
