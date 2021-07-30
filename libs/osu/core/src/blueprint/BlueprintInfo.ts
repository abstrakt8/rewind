import { BlueprintMetadata } from "./BlueprintMetadata";

export class BlueprintInfo {
  beatmapVersion = 0;
  onlineBeatmapId?: number;
  metadata: BlueprintMetadata = new BlueprintMetadata();
  audioLeadIn = 0;
  stackLeniency = 0.7;
}
