import { injectable } from "inversify";
import { BlueprintService } from "./BlueprintService";
import { ReplayService } from "./ReplayService";
import { createRewindStage } from "../stage";
import { buildBeatmap } from "@rewind/osu/core";

@injectable()
export class RewindStageService {
  constructor(private readonly blueprintService: BlueprintService, private readonly replayService: ReplayService) {}

  async createStage(blueprintId: string, replayId: string) {
    const [blueprint, replay] = await Promise.all([
      this.blueprintService.retrieveBlueprint(blueprintId),
      this.replayService.retrieveReplay(replayId),
    ]);
    // If the building is too slow or unbearable, we should push the building to a WebWorker
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });
    return createRewindStage({ beatmap, replay });
  }
}
