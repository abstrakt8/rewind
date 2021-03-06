import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { TextureManager } from "../../textures/TextureManager";
import { BeatmapBackgroundSettingsStore } from "../../services/BeatmapBackgroundSettingsStore";

interface BlueprintResources {
  blueprintRaw: string;
  // Audio
  // (?) Skin, hitsounds
  // (??) Storyboard
}

@injectable()
export class BlueprintService {
  constructor(
    @inject(TYPES.API_URL) private apiUrl: string,
    private readonly textureManager: TextureManager,
    private readonly beatmapBackgroundSettingsStore: BeatmapBackgroundSettingsStore,
  ) {}

  async retrieveRawBlueprint(blueprintId: string) {
    const url = `${this.apiUrl}/api/blueprints/${encodeURIComponent(blueprintId)}/osu`;
    const res = await fetch(url);
    return res.text();
  }

  // Blueprint resources
  // - Background
  // - Audio
  // - (?) Skin, hitsounds
  // - (?) Storyboard

  async retrieveBlueprintResources(blueprintId: string) {
    const url = `${this.apiUrl}/api/blueprints/${encodeURIComponent(blueprintId)}/bg`;
    this.beatmapBackgroundSettingsStore.texture$.next(await this.textureManager.loadTexture(url));
  }
}
