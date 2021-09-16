import { parseBlueprint } from "@rewind/osu/core";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { TextureManager } from "../TextureManager";

interface BlueprintResources {
  blueprintRaw: string;
  // Audio
  // (?) Skin, hitsounds
  // (??) Storyboard
}

@injectable()
export class BlueprintService {
  constructor(@inject(TYPES.API_URL) private apiUrl: string, private readonly textureManager: TextureManager) {}

  async retrieveBlueprint(blueprintId: string) {
    const url = `${this.apiUrl}/api/blueprints/${encodeURIComponent(blueprintId)}/osu`;
    const res = await fetch(url);
    const data = await res.text();
    // TODO: Emit
    return parseBlueprint(data);
  }

  // Blueprint resources
  // - Background
  // - Audio
  // - (?) Skin, hitsounds
  // - (?) Storyboard

  async retrieveBlueprintResources(blueprintId: string) {
    const url = `${this.apiUrl}/api/blueprints/${encodeURIComponent(blueprintId)}/bg`;
    return this.textureManager.loadTexture("BACKGROUND", url);
  }
}
