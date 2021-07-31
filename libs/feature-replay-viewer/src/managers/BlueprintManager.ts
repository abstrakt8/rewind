import { OsuBlueprintParser } from "@rewind/osu/core";
import { Blueprint } from "@rewind/osu/core";
import axios from "axios";

export interface BlueprintManager {
  loadBlueprint(blueprintId: string): Promise<Blueprint>;
}

/**
 * A beatmap manager that loads the beatmap from an osu-express API.
 */
export class OsuExpressBlueprintManager implements BlueprintManager {
  constructor(private readonly osuExpressUrl: string) {}

  // TODO: Ofc with caching some point in time
  async loadBlueprint(beatmapFolderAndFile: string): Promise<Blueprint> {
    const url = `${this.osuExpressUrl}/static/songs/${beatmapFolderAndFile}`;
    const name = `beatmaps/${beatmapFolderAndFile}/osu`;
    const osuFile = (await axios
      .get(url)
      .then((value) => value.data)
      .catch(console.error)) as string;
    return new OsuBlueprintParser(osuFile).parse();
  }
}

// OsuAPIBeatmapManager ... ?
