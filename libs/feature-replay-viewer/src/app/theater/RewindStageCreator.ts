import { injectable } from "inversify";
import { BlueprintService } from "./BlueprintService";
import { ReplayService } from "./ReplayService";
import { createRewindStage } from "../stage/createRewindStage";
import { buildBeatmap, determineDefaultPlaybackSpeed } from "@rewind/osu/core";
import { SkinService } from "./SkinService";
import { AudioService } from "./AudioService";
import { TextureManager } from "./TextureManager";
import { defaultViewSettings } from "../stage/rewind/ViewSettings";
import { defaultSkinId } from "./SkinId";

// There will also be a default osu! std skin

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

      // TODO: Loading the beatmap specific skin
      this.skinService.loadSkin(defaultSkinId),
    ]);

    await this.blueprintService.retrieveBlueprintResources(blueprintId);

    // If the building is too slow or unbearable, we should push the building to a WebWorker
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });

    const initialView = defaultViewSettings();
    initialView.modHidden = replay.mods.includes("HIDDEN");
    const initialSpeed = determineDefaultPlaybackSpeed(replay.mods);

    const songUrl = this.audioService.getSongUrl(blueprintId);
    const textureMap = this.textureManager.dict;
    return createRewindStage({ beatmap, replay, skin, songUrl, textureMap, initialView, initialSpeed });
  }
}
