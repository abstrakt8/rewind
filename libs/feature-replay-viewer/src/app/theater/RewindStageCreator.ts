import { injectable } from "inversify";
import { BlueprintService } from "./BlueprintService";
import { ReplayService } from "./ReplayService";
import { createRewindStage } from "../stage";
import { buildBeatmap } from "@rewind/osu/core";
import { SkinService } from "./SkinService";
import { AudioService } from "./AudioService";
import { TextureManager } from "./TextureManager";
import { defaultViewSettings } from "../../game/ViewSettings";

@injectable()
export class RewindStageCreator {
  constructor(
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly skinService: SkinService,
    private readonly audioService: AudioService,
    private readonly textureManager: TextureManager,
  ) {}

  async createStage(blueprintId: string, replayId: string) {
    const [blueprint, replay, skin] = await Promise.all([
      this.blueprintService.retrieveBlueprint(blueprintId),
      this.replayService.retrieveReplay(replayId),
      this.skinService.loadSkin("- Aristia(Edit)+trail"),
      this.textureManager.loadTexture("BACKGROUND", this.blueprintService.blueprintBgUrl(blueprintId)),
    ]);
    // If the building is too slow or unbearable, we should push the building to a WebWorker
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });

    const initialView = defaultViewSettings();
    initialView.modHidden = replay.mods.includes("HIDDEN");

    const songUrl = this.audioService.getSongUrl(blueprintId);
    const textureMap = this.textureManager.dict;
    return createRewindStage({ beatmap, replay, skin, songUrl, textureMap, initialView });
  }
}
