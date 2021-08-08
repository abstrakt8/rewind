import { Blueprint } from "@rewind/osu/core";
import { OsuExpressBlueprintManager } from "../api/BlueprintManager";

export class BlueprintService {
  constructor(private readonly url: string) {}

  async loadBlueprint(id: string): Promise<Blueprint> {
    const b = new OsuExpressBlueprintManager(this.url);
    return b.loadBlueprint(id);
  }

  backgroundUrl(id: string, bgFile: string) {
    return `${this.url}/api/blueprints/${id}/folder/${bgFile}`;
  }
}