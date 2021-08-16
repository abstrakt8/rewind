import { parseBlueprint } from "@rewind/osu/core";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";

@injectable()
export class BlueprintService {
  constructor(@inject(TYPES.API_URL) private apiUrl: string) {}

  async retrieveBlueprint(blueprintId: string) {
    const url = `${this.apiUrl}/api/blueprints/${blueprintId}/osu`;
    const res = await fetch(url);
    const data = await res.text();
    // TODO: Emit
    return parseBlueprint(data);
  }
}
