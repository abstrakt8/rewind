import { Beatmap } from "@rewind/osu/core";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { OsuReplay } from "../../theater";

@injectable()
export class GameSimulator {
  constructor(
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    @inject(TYPES.REPLAY) private readonly replay: OsuReplay,
  ) {}
  async simulate() {}

  // Very likely to be a request from the UI since it wants to render the playbar events
  async calculateEvents() {
    // In case it takes unbearably long -> we might need a web worker
  }
}
