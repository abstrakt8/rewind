import { Blueprint } from "@rewind/osu/core";
import { OsuExpressBlueprintManager } from "../api/BlueprintManager";

export class BlueprintService {
  constructor(private readonly url: string) {}

  async loadBlueprint(id: string): Promise<Blueprint> {
    const b = new OsuExpressBlueprintManager(this.url);
    return b.loadBlueprint(id);
  }
}
