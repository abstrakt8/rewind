import { HasId, HasSpawnTime } from "./Properties";

export class Spinner implements HasId, HasSpawnTime {
  id = "";
  startTime = 0;
  duration = 0;
  spinsRequired = 1;
  maximumBonusSpins = 1;

  // The spinner is visible way earlier, but can only be interacted with at [startTime, endTime]
  get spawnTime(): number {
    return this.startTime;
  }

  get type() {
    return "SPINNER";
  }
}
