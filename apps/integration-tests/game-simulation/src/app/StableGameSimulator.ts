import { GameSimulator } from "./GameSimulator";
import { Beatmap } from "@osujs/core";
import { Replay } from "node-osr";

export class StableGameSimulator implements GameSimulator {
  simulate(beatmap: Beatmap, replay: Replay) {
    return { "300": 5, "100": 4, "50": 2, "0": 100 };
  }
}
