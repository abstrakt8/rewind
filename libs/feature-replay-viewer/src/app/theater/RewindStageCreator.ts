import { injectable } from "inversify";
import { BlueprintService } from "./BlueprintService";
import { ReplayService } from "./ReplayService";
import { createRewindStage } from "../stage";
import { buildBeatmap } from "@rewind/osu/core";
import { SkinService } from "./SkinService";

@injectable()
export class RewindStageCreator {
  constructor(
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly skinService: SkinService,
  ) {}

  async createStage(blueprintId: string, replayId: string) {
    const [blueprint, replay, skin] = await Promise.all([
      this.blueprintService.retrieveBlueprint(blueprintId),
      this.replayService.retrieveReplay(replayId),
      this.skinService.loadSkin("- Aristia(Edit)+trail"),
    ]);
    // If the building is too slow or unbearable, we should push the building to a WebWorker
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });
    return createRewindStage({ beatmap, replay, skin });
  }
}
