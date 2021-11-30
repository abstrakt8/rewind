import { Beatmap } from "@rewind/osu/core";
import { Replay } from "node-osr";

export interface GameSimulator {
  simulate(beatmap: Beatmap, replay: Replay);
}
