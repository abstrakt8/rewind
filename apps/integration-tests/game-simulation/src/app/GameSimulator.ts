import { Beatmap } from "@osujs/core";
import { Replay } from "node-osr";

export interface GameSimulator {
  simulate(beatmap: Beatmap, replay: Replay);
}
